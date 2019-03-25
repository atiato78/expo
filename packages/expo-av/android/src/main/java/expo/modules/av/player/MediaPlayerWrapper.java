package expo.modules.av.player;


import android.content.Context;
import android.media.PlaybackParams;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.annotation.RequiresApi;
import android.util.Pair;
import android.view.Surface;

import org.jetbrains.annotations.NotNull;

import java.net.HttpCookie;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


class MediaPlayerWrapper implements
    ExpoPlayer,
    android.media.MediaPlayer.OnBufferingUpdateListener,
    android.media.MediaPlayer.OnCompletionListener,
    android.media.MediaPlayer.OnErrorListener,
    android.media.MediaPlayer.OnInfoListener,
    android.media.MediaPlayer.OnSeekCompleteListener,
    android.media.MediaPlayer.OnVideoSizeChangedListener {

  private Context mContext;

  static final String IMPLEMENTATION_NAME = "MediaPlayer";

  private android.media.MediaPlayer mMediaPlayer = null;
  private boolean mMediaPlayerHasStartedEver = false;
  private Integer mPlayableDurationMillis;

  private boolean mIsBuffering;

  private final Map<String, Object> mRequestHeaders;

  private PlayerStateListener mPlayerStateListener = dummyPlayerStateListener();

  public MediaPlayerWrapper(Context context, Map<String, Object> requestHeaders) {
    this.mContext = context;
    this.mRequestHeaders = requestHeaders;
  }

  @Override
  public void setPlayerStateListener(PlayerStateListener playerStateListener) {
    this.mPlayerStateListener = playerStateListener;
  }

  @Override
  public String getImplementationName() {
    return IMPLEMENTATION_NAME;
  }

  // --------- PlayerManager implementation ---------

  // Lifecycle

  @Override
  public void load(@NonNull final Bundle status, @NonNull Uri uri, @Nullable List<HttpCookie> cookies,
                   @Nullable final PlayerManager.LoadCompletionListener loadCompletionListener) {
    if (mMediaPlayer != null) {
      loadCompletionListener.onLoadError("Load encountered an error: MediaPlayerWrapper cannot be loaded twice.");
      return;
    }

    final android.media.MediaPlayer unpreparedPlayer = new android.media.MediaPlayer();

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        unpreparedPlayer.setDataSource(mContext, uri, null, cookies);
      } else {
        Map<String, String> headers = new HashMap<>(1);
        StringBuilder cookieBuilder = new StringBuilder();
        if (cookies != null) {
          for (HttpCookie httpCookie : cookies) {
            cookieBuilder.append(httpCookie.getName());
            cookieBuilder.append("=");
            cookieBuilder.append(httpCookie.getValue());
            cookieBuilder.append("; ");
          }
        }
        cookieBuilder.append("\r\n");
        headers.put("Cookie", cookieBuilder.toString());
        if (mRequestHeaders != null) {
          for (Map.Entry<String, Object> headerEntry : mRequestHeaders.entrySet()) {
            if (headerEntry.getValue() instanceof String) {
              headers.put(headerEntry.getKey(), (String) headerEntry.getValue());
            }
          }
        }
        unpreparedPlayer.setDataSource(mContext, uri, headers);
      }
    } catch (final Throwable throwable) {
      loadCompletionListener.onLoadError("Load encountered an error: setDataSource() threw an exception was thrown with message: " + throwable.toString());
      return;
    }

    unpreparedPlayer.setOnErrorListener((mp, what, extra) -> {
      loadCompletionListener.onLoadError("Load encountered an error: the OnErrorListener was called with 'what' code " + what + " and 'extra' code " + extra + ".");
      return true;
    });

    unpreparedPlayer.setOnPreparedListener(mp -> {
      mMediaPlayer = mp;
      mMediaPlayer.setOnBufferingUpdateListener(MediaPlayerWrapper.this);
      mMediaPlayer.setOnCompletionListener(MediaPlayerWrapper.this);
      mMediaPlayer.setOnErrorListener(MediaPlayerWrapper.this);
      mMediaPlayer.setOnInfoListener(MediaPlayerWrapper.this);

      loadCompletionListener.onLoadSuccess(status);
    });

    try {
      unpreparedPlayer.prepareAsync();
    } catch (final Throwable throwable) {
      loadCompletionListener.onLoadError("Load encountered an error: an exception was thrown from prepareAsync() with message: " + throwable.toString());
    }
  }

  @Override
  public synchronized void release() {
    if (mMediaPlayer != null) {
      mMediaPlayer.setOnBufferingUpdateListener(null);
      mMediaPlayer.setOnCompletionListener(null);
      mMediaPlayer.setOnErrorListener(null);
      mMediaPlayer.setOnInfoListener(null);
      mMediaPlayer.stop();
      mMediaPlayer.release();
      mMediaPlayer = null;
    }
  }

  @Override
  public boolean shouldContinueUpdatingProgress() {
    return mMediaPlayer != null && !mIsBuffering;
  }

  // Set status

  @Override
  public void play(boolean mute, float rate, boolean shouldCorrectPith) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      if (!mMediaPlayer.isPlaying()) {
        mMediaPlayer.start();
        mMediaPlayerHasStartedEver = true;
      }
    } else {
      boolean rateAndPitchAreSetCorrectly;
      try {
        final PlaybackParams params = mMediaPlayer.getPlaybackParams();
        final float setRate = params.getSpeed();
        final boolean setShouldCorrectPitch = params.getPitch() == 1.0f;
        rateAndPitchAreSetCorrectly = setRate == rate && setShouldCorrectPitch == shouldCorrectPith;
      } catch (final Throwable throwable) {
        rateAndPitchAreSetCorrectly = false;
      }
      if (rate != 0 && (!mMediaPlayer.isPlaying() || !rateAndPitchAreSetCorrectly)) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
          playMediaPlayerWithRateMAndHigher(rate, shouldCorrectPith);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          // Bizarrely, I wasn't able to change rate while a sound was playing unless I had
          // changed the rate to something other than 1f before the sound started.
          // This workaround seems to fix this issue (which is said to only be fixed in N):
          // https://code.google.com/p/android/issues/detail?id=192135
          playMediaPlayerWithRateMAndHigher(2f, shouldCorrectPith);
          mMediaPlayer.pause();
          playMediaPlayerWithRateMAndHigher(rate, shouldCorrectPith);
        }
        mMediaPlayerHasStartedEver = true;
      }
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.M)
  private void playMediaPlayerWithRateMAndHigher(final float rate, boolean shouldCorrectPitch) {
    final PlaybackParams params = mMediaPlayer.getPlaybackParams();
    params.setPitch(shouldCorrectPitch ? 1.0f : rate);
    params.setSpeed(rate);
    params.setAudioFallbackMode(PlaybackParams.AUDIO_FALLBACK_MODE_DEFAULT);
    mMediaPlayer.setPlaybackParams(params);
    mMediaPlayer.start();
  }

//  @Override
//  void applyNewStatus(final Integer newPositionMillis, final Boolean newIsLooping)
//      throws AudioFocusNotAcquiredException, IllegalStateException {
//    if (mMediaPlayer == null) {
//      throw new IllegalStateException("mMediaPlayer is null!");
//    }
//
//    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M && mRate != 1.0f) {
//      Log.w("Expo MediaPlayerWrapper", "Cannot set audio/video playback rate for Android SDK < 23.");
//      mRate = 1.0f;
//    }
//
//    // Set looping idempotently
//    if (newIsLooping != null) {
//      mMediaPlayer.setLooping(newIsLooping);
//    }
//
//    // Pause first if necessary.
//    if (!shouldPlayerPlay()) {
//      if (mMediaPlayerHasStartedEver) {
//        mMediaPlayer.pause();
//      }
//      stopUpdatingProgressIfNecessary();
//    }
//
//    // Mute / update volume if it doesn't require a request of the audio focus.
//    updateVolumeMuteAndDuck();
//
//    // Seek
//    if (newPositionMillis != null && newPositionMillis != mMediaPlayer.getCurrentPosition()) {
//      mMediaPlayer.seekTo(newPositionMillis);
//    }
//
//    // Play / unmute
//    playPlayerWithRateAndMuteIfNecessary();
//  }

  // Get status


  @Override
  public boolean isPlaying() {
    return mMediaPlayer != null && mMediaPlayer.isPlaying();
  }

  @Override
  public boolean isLoaded() {
    return mMediaPlayer != null;
  }

  @Override
  public boolean isBuffering() {
    return mIsBuffering;
  }

  @Override
  public boolean getLooping() {
    return mMediaPlayer.isLooping();
  }

  @Override
  public void setLooping(boolean looping) {
    mMediaPlayer.setLooping(looping);
  }

  @Override
  public void seekTo(int newPositionMillis) {
    mMediaPlayer.seekTo(newPositionMillis);
  }

  @Override
  public int getDuration() {
    return mMediaPlayer.getDuration();
  }

  @Override
  public int getPlayableDuration() {
    return mPlayableDurationMillis;
  }

  @Override
  public int getCurrentPosition() {
    return mMediaPlayer.getCurrentPosition();
  }

  // Video specific stuff

  @Override
  public Pair<Integer, Integer> getVideoWidthHeight() {
    return mMediaPlayer == null ? new Pair<>(0, 0) : new Pair<>(mMediaPlayer.getVideoWidth(), mMediaPlayer.getVideoHeight());
  }

  // TODO: We should be able to determine shouldPlay within this class. Passing it to this method does not look good.
  @Override
  public void setSurface(@NonNull final Surface surface, boolean shouldPlay) {
    if (mMediaPlayer == null) {
      return;
    }
    mMediaPlayer.setSurface(surface);
    if (!mMediaPlayerHasStartedEver && !shouldPlay) {
      // For some reason, the media player does not render to the screen until start() has been
      // called in some cases.
      mMediaPlayer.start();
      mMediaPlayer.pause();
      mMediaPlayerHasStartedEver = true;
    }
  }

  @Override
  public int getAudioSessionId() {
    return mMediaPlayer != null ? mMediaPlayer.getAudioSessionId() : 0;
  }

  // --------- Interface implementation ---------

  // AudioEventHandler

  @Override
  public void pauseImmediately() {
    if (mMediaPlayer != null && mMediaPlayerHasStartedEver) {
      mMediaPlayer.pause();
    }
  }

  @Override
  public void setVolume(float value) {
    if (mMediaPlayer != null) {
      mMediaPlayer.setVolume(value, value);
    }
  }

  // MediaPlayerWrapper.*Listener

  @Override
  public void onBufferingUpdate(final android.media.MediaPlayer mp, final int percent) {
    if (mp.getDuration() >= 0) {
      mPlayableDurationMillis = (int) (mp.getDuration() * (((double) percent) / 100.0));
    } else {
      mPlayableDurationMillis = null;
    }
    mPlayerStateListener.onBuffering(mPlayableDurationMillis);
  }

  @Override
  public void onCompletion(final android.media.MediaPlayer mp) {
    mPlayerStateListener.onCompleted();
  }

  @Override
  public boolean onError(final android.media.MediaPlayer mp, final int what, final int extra) {
    release();
    mPlayerStateListener.onError("MediaPlayerWrapper failed with 'what' code " + what + " and 'extra' code " + extra + ".");
    return true;
  }

  @Override
  public boolean onInfo(final android.media.MediaPlayer mp, final int what, final int extra) {
    // Writing out all of the possible values here for clarity
    // @jesseruder @nikki93 I think we should hold off on handling some of the more obscure values
    // until the ExoPlayer refactor.
    switch (what) {
      case android.media.MediaPlayer.MEDIA_INFO_BUFFERING_START:
        mIsBuffering = true;
        mPlayerStateListener.onBufferingStart();
        break;
      case android.media.MediaPlayer.MEDIA_INFO_BUFFERING_END:
        mIsBuffering = false;
        mPlayerStateListener.onBufferingStop();
        break;
      case android.media.MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START:
        mPlayerStateListener.videoSizeChanged(mp.getVideoWidth(), mp.getVideoHeight());
        break;
      case android.media.MediaPlayer.MEDIA_INFO_UNKNOWN:
      case android.media.MediaPlayer.MEDIA_INFO_BAD_INTERLEAVING:
      case android.media.MediaPlayer.MEDIA_INFO_NOT_SEEKABLE:
      case android.media.MediaPlayer.MEDIA_INFO_METADATA_UPDATE:
      case android.media.MediaPlayer.MEDIA_INFO_UNSUPPORTED_SUBTITLE:
      case android.media.MediaPlayer.MEDIA_INFO_SUBTITLE_TIMED_OUT:
      case android.media.MediaPlayer.MEDIA_INFO_VIDEO_TRACK_LAGGING:
        mPlayerStateListener.statusUpdated();
        break;

    }
    return true;
  }

  @Override
  public void onSeekComplete(final android.media.MediaPlayer mp) {
    mPlayerStateListener.onSeekCompleted();
  }

  @Override
  public void onVideoSizeChanged(final android.media.MediaPlayer mp, final int width, final int height) {
    mPlayerStateListener.videoSizeChanged(width, height);
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
