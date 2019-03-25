package expo.modules.av.player;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.text.TextUtils;
import android.util.Pair;
import android.view.Surface;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.PlaybackParameters;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory;
import com.google.android.exoplayer2.source.AdaptiveMediaSourceEventListener;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.dash.DashMediaSource;
import com.google.android.exoplayer2.source.dash.DefaultDashChunkSource;
import com.google.android.exoplayer2.source.hls.HlsMediaSource;
import com.google.android.exoplayer2.source.smoothstreaming.DefaultSsChunkSource;
import com.google.android.exoplayer2.source.smoothstreaming.SsMediaSource;
import com.google.android.exoplayer2.trackselection.AdaptiveTrackSelection;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.trackselection.TrackSelection;
import com.google.android.exoplayer2.trackselection.TrackSelector;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.util.Util;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.net.HttpCookie;
import java.util.List;

class ExoPlayerWrapper
    implements expo.modules.av.player.ExpoPlayer, Player.EventListener, ExtractorMediaSource.EventListener, com.google.android.exoplayer2.SimpleExoPlayer.VideoListener, AdaptiveMediaSourceEventListener {

  private static final String IMPLEMENTATION_NAME = "ExoPlayerWrapper";

  private com.google.android.exoplayer2.SimpleExoPlayer mSimpleExoPlayer = null;
  private String mOverridingExtension;
  private PlayerManager.LoadCompletionListener mLoadCompletionListener = null;
  private boolean mFirstFrameRendered = false;
  private Pair<Integer, Integer> mVideoWidthHeight = null;
  private Integer mLastPlaybackState = null;
  private boolean mIsLooping = false;
  private boolean mIsLoading = true;
  private final Context mContext;
  private final DataSource.Factory mDataSourceFactory;

  private PlayerStateListener mPlayerStateListener = dummyPlayerStateListener();

  public ExoPlayerWrapper(final Context context, final String overridingExtension, DataSource.Factory dataSourceFactory) {
    mContext = context;
    mOverridingExtension = overridingExtension;
    this.mDataSourceFactory = dataSourceFactory;
  }

  @Override
  public String getImplementationName() {
    return IMPLEMENTATION_NAME;
  }

  // --------- PlayerManager implementation ---------

  // Lifecycle

  @Override
  public void load(final Bundle status, Uri uri, List<HttpCookie> cookies,
                   final PlayerManager.LoadCompletionListener loadCompletionListener) {
    mLoadCompletionListener = loadCompletionListener;

    // Create a default TrackSelector
    final Handler mainHandler = new Handler();
    // Measures bandwidth during playback. Can be null if not required.
    final TrackSelection.Factory trackSelectionFactory = new AdaptiveTrackSelection.Factory();
    final TrackSelector trackSelector = new DefaultTrackSelector(trackSelectionFactory);

    // Create the player
    mSimpleExoPlayer = ExoPlayerFactory.newSimpleInstance(mContext, trackSelector);
    mSimpleExoPlayer.addListener(this);
    mSimpleExoPlayer.addVideoListener(this);

    // Produces DataSource instances through which media data is loaded.
    try {
      // This is the MediaSource representing the media to be played.
      final MediaSource source = buildMediaSource(uri, mOverridingExtension, mainHandler, mDataSourceFactory);

      // Prepare the player with the source.
      mSimpleExoPlayer.prepare(source);
      loadCompletionListener.onLoadSuccess(status);
    } catch (IllegalStateException e) {
      onFatalError(e);
    }
  }

  @Override
  public synchronized void release() {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer.release();
      mSimpleExoPlayer = null;
    }
  }

  @Override
  public boolean shouldContinueUpdatingProgress() {
    return mSimpleExoPlayer != null && mSimpleExoPlayer.getPlayWhenReady();
  }

  // Set status

  @Override
  public void play(boolean isMuted, float rate, boolean shouldCorrectPitch) {
    mSimpleExoPlayer.setPlaybackParameters(new PlaybackParameters(rate, shouldCorrectPitch ? 1.0f : rate));

    mSimpleExoPlayer.setPlayWhenReady(true);
  }

  // Get status

  @Override
  public boolean isLoaded() {
    return mSimpleExoPlayer != null;
  }

  // Video specific stuff

  @Override
  public Pair<Integer, Integer> getVideoWidthHeight() {
    return mVideoWidthHeight != null ? mVideoWidthHeight : new Pair<>(0, 0);
  }

  @Override
  public void setSurface(@NonNull final Surface surface, boolean ignore) {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer.setVideoSurface(surface);
    }
  }

  @Override
  public int getAudioSessionId() {
    return mSimpleExoPlayer != null ? mSimpleExoPlayer.getAudioSessionId() : 0;
  }

  @Override
  public boolean getLooping() {
    return mIsLooping;
  }

  @Override
  public boolean isPlaying() {
    return mSimpleExoPlayer.getPlayWhenReady();
  }

  @Override
  public boolean isBuffering() {
    return mIsLoading || mSimpleExoPlayer.getPlaybackState() == Player.STATE_BUFFERING;
  }

  @Override
  public int getDuration() {
    return (int) mSimpleExoPlayer.getDuration();
  }

  @Override
  public int getPlayableDuration() {
    return (int) mSimpleExoPlayer.getBufferedPosition();
  }

  @Override
  public int getCurrentPosition() {
    return (int) mSimpleExoPlayer.getCurrentPosition();
  }

  // --------- Interface implementation ---------

  // AudioEventHandler

  @Override
  public void pauseImmediately() {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer.setPlayWhenReady(false);
    }
  }

  @Override
  public void setVolume(float value) {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer.setVolume(value);
    }
  }

  // ExoPlayer.EventListener

  @Override
  public void onLoadingChanged(final boolean isLoading) {
    mIsLoading = isLoading;
    if (!isLoading) {
      mPlayerStateListener.onBufferingStop();
    } else {
      mPlayerStateListener.onBufferingStart();
    }
  }

  @Override
  public void onPlayerStateChanged(final boolean playWhenReady, final int playbackState) {
    if (playbackState == Player.STATE_READY && mLoadCompletionListener != null) {
      final PlayerManager.LoadCompletionListener listener = mLoadCompletionListener;
      mLoadCompletionListener = null;
      listener.onLoadSuccess(null);
    }

    if (mLastPlaybackState != null
        && playbackState != mLastPlaybackState
        && playbackState == Player.STATE_ENDED) {
      mPlayerStateListener.onCompleted();
    } else {
      mPlayerStateListener.statusUpdated();
    }
    mLastPlaybackState = playbackState;
  }

  @Override
  public void onPlayerError(final ExoPlaybackException error) {
    onFatalError(error.getCause());
  }

  @Override
  public void onPositionDiscontinuity(int reason) {
    // According to the documentation:
    // > A period defines a single logical piece of media, for example a media file.
    // > It may also define groups of ads inserted into the media,
    // > along with information about whether those ads have been loaded and played.
    // Source: https://google.github.io/ExoPlayer/doc/reference/com/google/android/exoplayer2/Timeline.Period.html
    // So I guess it's safe to say that when a period transition happens,
    // media file transition happens, so we just finished playing one.
    if (reason == Player.DISCONTINUITY_REASON_PERIOD_TRANSITION) {
      mPlayerStateListener.onCompleted();
    }
  }


  // ExtractorMediaSource.EventListener

  @Override
  public void onLoadError(final IOException error) {
    onFatalError(error);
  }

  private void onFatalError(final Throwable error) {
    if (mLoadCompletionListener != null) {
      final PlayerManager.LoadCompletionListener listener = mLoadCompletionListener;
      mLoadCompletionListener = null;
      listener.onLoadError(error.toString());
    } else {
      mPlayerStateListener.onError("ExpoPlayer error: " + error.getMessage());
    }
    release();
  }

  // ExoPlayerWrapper.VideoListener

  @Override
  public void onVideoSizeChanged(final int width, final int height, final int unAppliedRotationDegrees, final float pixelWidthHeightRatio) {
    // TODO other params?
    mVideoWidthHeight = new Pair<>(width, height);
    if (mFirstFrameRendered) {
      mPlayerStateListener.videoSizeChanged(width, height);
    }
  }

  @Override
  public void onRenderedFirstFrame() {
    if (!mFirstFrameRendered && mVideoWidthHeight != null) {
      mPlayerStateListener.videoSizeChanged(mVideoWidthHeight.first, mVideoWidthHeight.second);
    }
    mFirstFrameRendered = true;
  }

  // https://github.com/google/ExoPlayer/blob/2b20780482a9c6b07416bcbf4de829532859d10a/demos/main/src/main/java/com/google/android/exoplayer2/demo/PlayerActivity.java#L365-L393
  private MediaSource buildMediaSource(Uri uri, String overrideExtension, Handler mainHandler, DataSource.Factory factory) {
    @C.ContentType int type = TextUtils.isEmpty(overrideExtension) ? Util.inferContentType(String.valueOf(uri)) : Util.inferContentType("." + overrideExtension);
    switch (type) {
      case C.TYPE_SS:
        return new SsMediaSource(uri, factory,
            new DefaultSsChunkSource.Factory(factory), mainHandler, this);
      case C.TYPE_DASH:
        return new DashMediaSource(uri, factory,
            new DefaultDashChunkSource.Factory(factory), mainHandler, this);
      case C.TYPE_HLS:
        return new HlsMediaSource(uri, factory, mainHandler, this);
      case C.TYPE_OTHER:
        return new ExtractorMediaSource(uri, factory, new DefaultExtractorsFactory(), mainHandler, this);
      default: {
        throw new IllegalStateException("Content of this type is unsupported at the moment. Unsupported type: " + type);
      }
    }
  }

  // AdaptiveMediaSourceEventListener
  @Override
  public void onMediaPeriodCreated(int windowIndex, MediaSource.MediaPeriodId mediaPeriodId) {

  }

  @Override
  public void onMediaPeriodReleased(int windowIndex, MediaSource.MediaPeriodId mediaPeriodId) {

  }

  @Override
  public void onLoadStarted(int windowIndex, @Nullable MediaSource.MediaPeriodId mediaPeriodId, LoadEventInfo loadEventInfo, MediaLoadData mediaLoadData) {

  }

  @Override
  public void onLoadCompleted(int windowIndex, @Nullable MediaSource.MediaPeriodId mediaPeriodId, LoadEventInfo loadEventInfo, MediaLoadData mediaLoadData) {

  }

  @Override
  public void onLoadCanceled(int windowIndex, @Nullable MediaSource.MediaPeriodId mediaPeriodId, LoadEventInfo loadEventInfo, MediaLoadData mediaLoadData) {

  }

  @Override
  public void onLoadError(int windowIndex, @Nullable MediaSource.MediaPeriodId mediaPeriodId, LoadEventInfo loadEventInfo, MediaLoadData mediaLoadData, IOException error, boolean wasCanceled) {
    onLoadError(error);
  }

  @Override
  public void onReadingStarted(int windowIndex, MediaSource.MediaPeriodId mediaPeriodId) {

  }

  @Override
  public void onUpstreamDiscarded(int windowIndex, MediaSource.MediaPeriodId mediaPeriodId, MediaLoadData mediaLoadData) {

  }

  @Override
  public void onDownstreamFormatChanged(int windowIndex, @Nullable MediaSource.MediaPeriodId mediaPeriodId, MediaLoadData mediaLoadData) {

  }

  @Override
  public void setLooping(boolean b) {
    mSimpleExoPlayer.setRepeatMode(b ? Player.REPEAT_MODE_ALL : Player.REPEAT_MODE_OFF);
  }

  @Override
  public void seekTo(int newPositionMillis) {
    mSimpleExoPlayer.seekTo(newPositionMillis);
  }

  @Override
  public void setPlayerStateListener(@NotNull PlayerStateListener listener) {
    this.mPlayerStateListener = listener;
  }

  @NotNull
  private PlayerStateListener dummyPlayerStateListener() {
    return new PlayerStateListener() {

      @Override
      public void onCompleted() {
      }

      @Override
      public void onError(@NotNull String message) {
      }

      @Override
      public void onBufferingStart() {
      }

      @Override
      public void onBuffering(int bufferedDuration) {
      }

      @Override
      public void onBufferingStop() {
      }

      @Override
      public void onSeekCompleted() {
      }

      @Override
      public void videoSizeChanged(int width, int height) {
      }

      @Override
      public void statusUpdated() {
      }
    };
  }

}
