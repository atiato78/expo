package expo.modules.av.player;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.util.Pair;
import android.view.Surface;

import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.util.Util;

import org.unimodules.core.Promise;
import org.unimodules.core.arguments.ReadableArguments;

import java.io.IOException;
import java.lang.ref.WeakReference;
import java.net.CookieHandler;
import java.net.HttpCookie;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import expo.modules.av.AVManagerInterface;
import expo.modules.av.AudioEventHandler;
import expo.modules.av.AudioFocusNotAcquiredException;
import expo.modules.av.player.datasource.DataSourceFactoryProvider;
import expo.modules.av.player.exoplayer.ExoPlayerWrapper;
import expo.modules.av.player.mediaPlayer.MediaPlayerWrapper;

public class PlayerManager implements AudioEventHandler, ExpoPlayer.PlayerStateListener {
  static final String STATUS_ANDROID_IMPLEMENTATION_KEY_PATH = "androidImplementation";
  static final String STATUS_HEADERS_KEY_PATH = "headers";
  static final String STATUS_IS_LOADED_KEY_PATH = "isLoaded";
  public static final String STATUS_URI_KEY_PATH = "uri";
  static final String STATUS_OVERRIDING_EXTENSION_KEY_PATH = "overridingExtension";
  static final String STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH = "progressUpdateIntervalMillis";
  static final String STATUS_DURATION_MILLIS_KEY_PATH = "durationMillis";
  static final String STATUS_POSITION_MILLIS_KEY_PATH = "positionMillis";
  static final String STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH = "playableDurationMillis";
  static final String STATUS_SHOULD_PLAY_KEY_PATH = "shouldPlay";
  public static final String STATUS_IS_PLAYING_KEY_PATH = "isPlaying";
  static final String STATUS_IS_BUFFERING_KEY_PATH = "isBuffering";
  static final String STATUS_RATE_KEY_PATH = "rate";
  static final String STATUS_SHOULD_CORRECT_PITCH_KEY_PATH = "shouldCorrectPitch";
  static final String STATUS_VOLUME_KEY_PATH = "volume";
  static final String STATUS_IS_MUTED_KEY_PATH = "isMuted";
  static final String STATUS_IS_LOOPING_KEY_PATH = "isLooping";
  static final String STATUS_DID_JUST_FINISH_KEY_PATH = "didJustFinish";

  public static Bundle getUnloadedStatus() {
    final Bundle map = new Bundle();
    map.putBoolean(STATUS_IS_LOADED_KEY_PATH, false);
    return map;
  }

  public interface VideoSizeUpdateListener {
    void onVideoSizeUpdate(final Pair<Integer, Integer> videoWidthHeight);
  }

  public interface ErrorListener {
    void onError(final String error);
  }

  public interface LoadCompletionListener {
    void onLoadSuccess(Bundle status);

    void onLoadError(final String error);
  }

  public interface StatusUpdateListener {
    void onStatusUpdate(final Bundle status);
  }

  interface SetStatusCompletionListener {
    void onSetStatusComplete();

    void onSetStatusError(final String error);
  }

  public interface FullscreenPresenter {
    boolean isBeingPresentedFullscreen();

    void setFullscreenMode(boolean isFullscreen);
  }

  private final AVManagerInterface mAVModule;
  private final Uri mUri;

  private Handler mHandler = new Handler();
  private Runnable mProgressUpdater = new ProgressUpdater(this);

  private ExpoPlayer mPlayer;

  private class ProgressUpdater implements Runnable {
    private WeakReference<PlayerManager> mPlayerDataWeakReference;

    private ProgressUpdater(PlayerManager playerManager) {
      mPlayerDataWeakReference = new WeakReference<>(playerManager);
    }

    @Override
    public void run() {
      final PlayerManager playerManager = mPlayerDataWeakReference.get();
      if (playerManager != null) {
        playerManager.callStatusUpdateListener();
        playerManager.progressUpdateLoop();
      }
    }
  }

  private FullscreenPresenter mFullscreenPresenter = null;
  private StatusUpdateListener mStatusUpdateListener = null;
  ErrorListener mErrorListener = null;
  VideoSizeUpdateListener mVideoSizeUpdateListener = null;

  private int mProgressUpdateIntervalMillis = 500;
  boolean mShouldPlay = false;
  float mRate = 1.0f;
  boolean mShouldCorrectPitch = false;
  float mVolume = 1.0f;
  boolean mIsMuted = false;

  PlayerManager(final ExpoPlayer player, final AVManagerInterface avModule, final Uri uri) {
    this.mPlayer = player;
    player.setPlayerStateListener(this);
    mAVModule = avModule;
    mUri = uri;
  }

  public static PlayerManager createUnloadedPlayerData(final AVManagerInterface avModule, final Context context, final ReadableArguments source, final Bundle status) {
    final String uriString = source.getString(STATUS_URI_KEY_PATH);
    Map requestHeaders = null;
    if (source.containsKey(STATUS_HEADERS_KEY_PATH)) {
      requestHeaders = source.getMap(STATUS_HEADERS_KEY_PATH);
    }
    final String uriOverridingExtension = source.containsKey(STATUS_OVERRIDING_EXTENSION_KEY_PATH) ? source.getString(STATUS_OVERRIDING_EXTENSION_KEY_PATH) : null;
    // uriString is guaranteed not to be null (both VideoView.setSource and Sound.loadAsync handle that case)
    final Uri uri = Uri.parse(uriString);

    if (status.containsKey(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH)
        && status.getString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH).equals(MediaPlayerWrapper.IMPLEMENTATION_NAME)) {
      return new PlayerManager(new MediaPlayerWrapper(context, requestHeaders), avModule, uri);
    } else {
      DataSource.Factory sourceFactory = avModule.getModuleRegistry().getModule(DataSourceFactoryProvider.class).createFactory(context, avModule.getModuleRegistry(), Util.getUserAgent(avModule.getContext(), "yourApplicationName"), requestHeaders);
      return new PlayerManager(new ExoPlayerWrapper(context, uriOverridingExtension, sourceFactory), avModule, uri);
    }
  }

  // Lifecycle

  // TODO: change status to class I've created
  public void load(final Bundle status, final LoadCompletionListener loadCompletionListener) {
    this.mPlayer.load(status, mUri, getHttpCookiesList(), new LoadCompletionListener() {
      @Override
      public void onLoadSuccess(Bundle status) {
        setStatusWithListener(status, new SetStatusCompletionListener() {
          @Override
          public void onSetStatusComplete() {
            loadCompletionListener.onLoadSuccess(getStatus());
          }

          @Override
          public void onSetStatusError(String error) {
            loadCompletionListener.onLoadSuccess(getStatus());
          }
        });
      }

      @Override
      public void onLoadError(String error) {
        loadCompletionListener.onLoadError(error);
      }
    });
  }

  public void setSurface(Surface surface) {
    this.mPlayer.setSurface(surface, mShouldPlay);
  }

  public Pair<Integer, Integer> getVideoWidthHeight() {
    return mPlayer.getVideoWidthHeight();
  }

  public void release() {
    stopUpdatingProgressIfNecessary();
    this.mPlayer.release();
  }

  // Status update listener

  private void callStatusUpdateListenerWithStatus(final Bundle status) {
    if (mStatusUpdateListener != null) {
      mStatusUpdateListener.onStatusUpdate(status);
    }
  }

  final void callStatusUpdateListenerWithDidJustFinish() {
    final Bundle status = getStatus();
    status.putBoolean(STATUS_DID_JUST_FINISH_KEY_PATH, true);
    callStatusUpdateListenerWithStatus(status);
  }

  final void callStatusUpdateListener() {
    callStatusUpdateListenerWithStatus(getStatus());
  }

  final void stopUpdatingProgressIfNecessary() {
    mHandler.removeCallbacks(mProgressUpdater);
  }

  private void progressUpdateLoop() {
    if (!mPlayer.getContinueUpdatingProgress()) {
      stopUpdatingProgressIfNecessary();
    } else {
      mHandler.postDelayed(mProgressUpdater, mProgressUpdateIntervalMillis);
    }
  }

  final void beginUpdatingProgressIfNecessary() {
    mHandler.post(mProgressUpdater);
  }

  public final void setStatusUpdateListener(final StatusUpdateListener listener) {
    mStatusUpdateListener = listener;
    if (mStatusUpdateListener != null) {
      beginUpdatingProgressIfNecessary();
    }
  }

  // Error listener

  public final void setErrorListener(final ErrorListener listener) {
    mErrorListener = listener;
  }

  // Status

  final boolean shouldPlayerPlay() {
    return mShouldPlay && mRate > 0.0;
  }

  final void setStatusWithListener(Bundle status, final SetStatusCompletionListener setStatusCompletionListener) {
    if (status == null) status = getStatus();
    if (status.containsKey(STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH)) {
      mProgressUpdateIntervalMillis = (int) status.getDouble(STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH);
    }

    if (status.containsKey(STATUS_SHOULD_PLAY_KEY_PATH)) {
      mShouldPlay = status.getBoolean(STATUS_SHOULD_PLAY_KEY_PATH);
    }

    if (status.containsKey(STATUS_RATE_KEY_PATH)) {
      mRate = (float) status.getDouble(STATUS_RATE_KEY_PATH);
    }

    if (status.containsKey(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH)) {
      mShouldCorrectPitch = status.getBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH);
    }

    if (status.containsKey(STATUS_VOLUME_KEY_PATH)) {
      mVolume = (float) status.getDouble(STATUS_VOLUME_KEY_PATH);
    }

    if (status.containsKey(STATUS_IS_MUTED_KEY_PATH)) {
      mIsMuted = status.getBoolean(STATUS_IS_MUTED_KEY_PATH);
    }

    if (status.containsKey(STATUS_POSITION_MILLIS_KEY_PATH)) {
      // Even though we set the position with an int, this is a double in the map because iOS can
      // take a floating point value for positionMillis.
      mPlayer.seekTo((int) status.getDouble(STATUS_POSITION_MILLIS_KEY_PATH));
    }
    if (status.containsKey(STATUS_IS_LOOPING_KEY_PATH)) {
      mPlayer.setLooping(status.getBoolean(STATUS_IS_LOOPING_KEY_PATH));
    }

    if (!shouldPlayerPlay()) {
      mPlayer.pauseImmediately();
    } else {
      try {
        mAVModule.acquireAudioFocus();
        updateVolumeMuteAndDuck();
        mPlayer.play(mIsMuted, mRate, mShouldCorrectPitch);

        mAVModule.abandonAudioFocusIfUnused();
      } catch (AudioFocusNotAcquiredException ex) {
        mAVModule.abandonAudioFocusIfUnused();
        setStatusCompletionListener.onSetStatusError(ex.toString());
      }
    }
    setStatusCompletionListener.onSetStatusComplete();

  }

  public final void setStatus(final Bundle status, final Promise promise) {
    if (status == null) {
      if (promise != null) {
        promise.reject("E_AV_SETSTATUS", "Cannot set null status.");
      }
      return;
    }

    try {
      setStatusWithListener(status, new SetStatusCompletionListener() {
        @Override
        public void onSetStatusComplete() {
          if (promise == null) {
            callStatusUpdateListener();
          } else {
            promise.resolve(getStatus());
          }
        }

        @Override
        public void onSetStatusError(final String error) {
          if (promise == null) {
            callStatusUpdateListener();
          } else {
            promise.reject("E_AV_SETSTATUS", error);
          }
        }
      });
    } catch (final Throwable throwable) {
      if (promise != null) {
        promise.reject("E_AV_SETSTATUS", "Encountered an error while setting status!", throwable);
      }
    }
  }

  final int getClippedIntegerForValue(final Integer value, final Integer min, final Integer max) {
    return (min != null && value < min) ? min : (max != null && value > max) ? max : value;
  }

  // Sometimes another thread would release the player
  // in the middle of `getStatus()` call, which would result
  // in a null reference method invocation in `getExtraStatusFields`,
  // so we need to ensure nothing will release or nullify the property
  // while we get the latest status.
  public synchronized final Bundle getStatus() {
    if (!mPlayer.getLoaded()) {
      final Bundle map = getUnloadedStatus();
      map.putString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, mPlayer.getImplementationName());
      return map;
    }

    final Bundle map = new Bundle();

    map.putBoolean(STATUS_IS_LOADED_KEY_PATH, true);
    map.putString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, mPlayer.getImplementationName());

    map.putString(STATUS_URI_KEY_PATH, mUri.getPath());

    map.putDouble(STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH, mProgressUpdateIntervalMillis);
    // STATUS_DURATION_MILLIS_KEY_PATH, STATUS_POSITION_MILLIS_KEY_PATH,
    // and STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH are set in addExtraStatusFields().

    map.putBoolean(STATUS_SHOULD_PLAY_KEY_PATH, mShouldPlay);
    // STATUS_IS_PLAYING_KEY_PATH and STATUS_IS_BUFFERING_KEY_PATH are set
    // in addExtraStatusFields().

    map.putDouble(STATUS_RATE_KEY_PATH, (double) mRate);
    map.putBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH, mShouldCorrectPitch);
    map.putDouble(STATUS_VOLUME_KEY_PATH, (double) mVolume);
    map.putBoolean(STATUS_IS_MUTED_KEY_PATH, mIsMuted);
    // STATUS_IS_LOOPING_KEY_PATH is set in addExtraStatusFields().

    map.putBoolean(STATUS_DID_JUST_FINISH_KEY_PATH, false);

    Integer duration = mPlayer.getDuration();
    duration = duration < 0 ? null : duration;
    if (duration != null) {
      map.putInt(STATUS_DURATION_MILLIS_KEY_PATH, duration);
    }
    map.putInt(STATUS_POSITION_MILLIS_KEY_PATH, getClippedIntegerForValue(mPlayer.getCurrentPosition(), 0, duration));

    Integer mPlayableDurationMillis = mPlayer.getPlayableDuration();
    if (mPlayableDurationMillis != null) {
      map.putInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, getClippedIntegerForValue(mPlayableDurationMillis, 0, duration));
    }

    map.putBoolean(STATUS_IS_PLAYING_KEY_PATH, mPlayer.getPlaying());
    map.putBoolean(STATUS_IS_BUFFERING_KEY_PATH, mPlayer.getBuffering());

    map.putBoolean(STATUS_IS_LOOPING_KEY_PATH, mPlayer.getLooping());

    return map;
  }

  // Video specific stuff

  public final void setVideoSizeUpdateListener(final VideoSizeUpdateListener videoSizeUpdateListener) {
    mVideoSizeUpdateListener = videoSizeUpdateListener;
  }

  public final void setFullscreenPresenter(final FullscreenPresenter fullscreenPresenter) {
    mFullscreenPresenter = fullscreenPresenter;
  }

  int getAudioSessionId() {
    return mPlayer.getAudioSessionId();
  }

  public boolean isPresentedFullscreen() {
    return mFullscreenPresenter.isBeingPresentedFullscreen();
  }

  public void toggleFullscreen() {
    mFullscreenPresenter.setFullscreenMode(!isPresentedFullscreen());
  }

  // AudioEventHandler

  @Override
  public final void handleAudioFocusInterruptionBegan() {
    if (!mIsMuted) {
      pauseImmediately();
      stopUpdatingProgressIfNecessary();
    }
  }

  @Override
  public final void handleAudioFocusGained() {
    try {
      acquireFocusAndPlay();
    } catch (final AudioFocusNotAcquiredException e) {
      // This is ok -- we might be paused or audio might have been disabled.
    }
  }

  @Override
  public final void onPause() {
    pauseImmediately();
  }

  @Override
  public void pauseImmediately() {
    mPlayer.pauseImmediately();
  }

  @Override
  public boolean requiresAudioFocus() {
    return mPlayer.getPlaying() && !mIsMuted;
  }

  @Override
  public void updateVolumeMuteAndDuck() {
    if (mPlayer.getLoaded()) {
      mPlayer.setVolume(mAVModule.getVolumeForDuckAndFocus(mIsMuted, mVolume));
    }
  }

  @Override
  public final void onResume() {
    try {
      acquireFocusAndPlay();
    } catch (final AudioFocusNotAcquiredException e) {
      // Do nothing -- another app has audio focus for now, and handleAudioFocusGained() will be
      // called when it abandons it.
    }
  }

  @Override
  public void onCompleted() {
    callStatusUpdateListenerWithDidJustFinish();

    if (!mPlayer.getLooping()) {
      mAVModule.abandonAudioFocusIfUnused();
    }
  }

  @Override
  public void onSeekCompleted() {
    callStatusUpdateListener();
  }

  @Override
  public void onError(@NonNull String message) {
    mErrorListener.onError(message);
  }

  @Override
  public void onBufferingStart() {
    callStatusUpdateListener();
  }

  @Override
  public void onBuffering(int bufferedDuration) {
    callStatusUpdateListener();
  }

  @Override
  public void onBufferingStop() {
    callStatusUpdateListener();
  }

  @Override
  public void statusUpdated() {
    callStatusUpdateListener();
  }

  @Override
  public void videoSizeChanged(int width, int height) {
    if (mVideoSizeUpdateListener != null) {
      mVideoSizeUpdateListener.onVideoSizeUpdate(new Pair<>(width, height));
    }
  }

  private void acquireFocusAndPlay() throws AudioFocusNotAcquiredException {
    if (!mPlayer.getLoaded() || !shouldPlayerPlay()) {
      return;
    }

    if (!mIsMuted) {
      mAVModule.acquireAudioFocus();
    }

    updateVolumeMuteAndDuck();

    mPlayer.play(mIsMuted, mRate, mShouldCorrectPitch);

    beginUpdatingProgressIfNecessary();
  }

  @NonNull
  private List<HttpCookie> getHttpCookiesList() {
    if (mAVModule.getModuleRegistry() != null) {
      CookieHandler cookieHandler = mAVModule.getModuleRegistry().getModule(CookieHandler.class);
      if (cookieHandler != null) {
        try {
          Map<String, List<String>> headersMap = cookieHandler.get(URI.create(mUri.toString()), null);
          List<String> cookies = headersMap.get("Cookie");
          if (cookies != null) {
            List<HttpCookie> httpCookies = new ArrayList<>();
            for (String cookieValue : cookies) {
              httpCookies.addAll(HttpCookie.parse(cookieValue));
            }
            return httpCookies;
          } else {
            return Collections.emptyList();
          }
        } catch (IOException e) {
          // do nothing, we'll return an empty list
        }
      }
    }
    return Collections.emptyList();
  }

}
