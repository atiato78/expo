package expo.modules.av.video;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Pair;
import android.view.MotionEvent;
import android.view.Surface;
import android.widget.FrameLayout;

import com.yqritc.scalablevideoview.ScalableType;

import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.arguments.ReadableArguments;
import org.unimodules.core.interfaces.services.EventEmitter;

import expo.modules.av.AVManagerInterface;
import expo.modules.av.Params;
import expo.modules.av.Source;
import expo.modules.av.Status;
import expo.modules.av.audio.AudioEventHandler;
import expo.modules.av.player.PlayerManager;

@SuppressLint("ViewConstructor")
public class VideoView extends FrameLayout implements AudioEventHandler, FullscreenVideoPlayerPresentationChangeListener, PlayerManager.FullscreenPresenter {

  private final Runnable mMediaControllerUpdater = new Runnable() {
    @Override
    public void run() {
      if (mMediaController != null) {
        mMediaController.updateControls();
      }
    }
  };

  private final PlayerManager.ParamsUpdatedListener mStatusUpdateListener = new PlayerManager.ParamsUpdatedListener() {
    public void onParamsUpdate(final Params status) {
      post(mMediaControllerUpdater);
      mEventEmitter.emit(getReactId(), VideoViewManager.Events.EVENT_STATUS_UPDATE.toString(), status.toBundle());
    }
  };

  private EventEmitter mEventEmitter;
  private final AVManagerInterface mAVModule;
  private VideoViewWrapper mVideoViewWrapper;

  private PlayerManager mPlayerManager = null;

  private ScalableType mResizeMode = ScalableType.LEFT_TOP;
  private boolean mUseNativeControls = false;
  private Boolean mOverridingUseNativeControls = null;
  private MediaController mMediaController = null;
  private Pair<Integer, Integer> mVideoWidthHeight = null;
  private FullscreenVideoPlayerPresentationChangeProgressListener mFullscreenPlayerPresentationChangeProgressListener = null;

  private Params mParamsToSet = null;

  private FullscreenVideoPlayer mFullscreenPlayer = null;
  private VideoTextureView mVideoTextureView = null;

  // Fullscreen change requests before the video loads
  private boolean mIsLoaded = false;
  private boolean mShouldShowFullscreenPlayerOnLoad = false;
  private FullscreenVideoPlayerPresentationChangeProgressListener mFullscreenVideoPlayerPresentationOnLoadChangeListener = null;

  public VideoView(@NonNull Context context, VideoViewWrapper videoViewWrapper, ModuleRegistry moduleRegistry) {
    super(context);

    mVideoViewWrapper = videoViewWrapper;

    mEventEmitter = moduleRegistry.getModule(EventEmitter.class);
    mAVModule = moduleRegistry.getModule(AVManagerInterface.class);
    mAVModule.registerVideoViewForAudioLifecycle(this);

    mVideoTextureView = new VideoTextureView(context, this);
    addView(mVideoTextureView, generateDefaultLayoutParams());

    mFullscreenPlayer = new FullscreenVideoPlayer(context, this, moduleRegistry);
    mFullscreenPlayer.setUpdateListener(this);

    mMediaController = new MediaController(VideoView.this.getContext());
    mMediaController.setAnchorView(this);
    maybeUpdateMediaControllerForUseNativeControls();
  }

  public void unloadPlayerAndMediaController() {
    ensureFullscreenPlayerIsDismissed();
    if (mMediaController != null) {
      mMediaController.hide();
      mMediaController.setEnabled(false);
      mMediaController.setAnchorView(null);
      mMediaController = null;
    }
    if (mPlayerManager != null) {
      mPlayerManager.release();
      mPlayerManager = null;
    }
    mIsLoaded = false;
  }

  void onDropViewInstance() {
    mAVModule.unregisterVideoViewForAudioLifecycle(this);
    unloadPlayerAndMediaController();
  }

  private void callOnError(final String error) {
    final Bundle map = new Bundle();
    map.putString("error", error);
    mEventEmitter.emit(getReactId(), VideoViewManager.Events.EVENT_ERROR.toString(), map);
  }

  private void callOnReadyForDisplay(final Pair<Integer, Integer> videoWidthHeight) {
    if (videoWidthHeight != null && mIsLoaded) {
      final int width = videoWidthHeight.first;
      final int height = videoWidthHeight.second;

      if (width == 0 || height == 0) {
        return;
      }

      final Bundle naturalSize = new Bundle();
      naturalSize.putInt("width", width);
      naturalSize.putInt("height", height);
      naturalSize.putString("orientation", width > height ? "landscape" : "portrait");

      final Bundle map = new Bundle();
      map.putBundle("naturalSize", naturalSize);
      map.putBundle("status", mPlayerManager.getStatus().toBundle());
      mEventEmitter.emit(getReactId(), VideoViewManager.Events.EVENT_READY_FOR_DISPLAY.toString(), map);
    }
  }

  public void maybeUpdateMediaControllerForUseNativeControls() {
    maybeUpdateMediaControllerForUseNativeControls(true);
  }

  public void maybeUpdateMediaControllerForUseNativeControls(boolean showMediaControllerIfEnabled) {
    if (mPlayerManager != null && mMediaController != null) {
      mMediaController.updateControls();
      mMediaController.setEnabled(shouldUseNativeControls());
      if (shouldUseNativeControls() && showMediaControllerIfEnabled) {
        mMediaController.show();
      } else {
        mMediaController.hide();
      }
    }
  }

  // Imperative API

  public void ensureFullscreenPlayerIsPresented() {
    ensureFullscreenPlayerIsPresented(null);
  }

  public void ensureFullscreenPlayerIsPresented(FullscreenVideoPlayerPresentationChangeProgressListener listener) {
    if (!mIsLoaded) {
      saveFullscreenPlayerStateForOnLoad(true, listener);
      return;
    }

    if (mFullscreenPlayerPresentationChangeProgressListener != null) {
      if (listener != null) {
        listener.onFullscreenPlayerPresentationTriedToInterrupt();
      }
      return;
    }

    if (!isBeingPresentedFullscreen()) {
      if (listener != null) {
        mFullscreenPlayerPresentationChangeProgressListener = listener;
      }

      mFullscreenPlayer.show();
    } else {
      if (listener != null) {
        listener.onFullscreenPlayerDidPresent();
      }
    }
  }

  public void ensureFullscreenPlayerIsDismissed() {
    ensureFullscreenPlayerIsDismissed(null);
  }

  public void ensureFullscreenPlayerIsDismissed(FullscreenVideoPlayerPresentationChangeProgressListener listener) {
    if (!mIsLoaded) {
      saveFullscreenPlayerStateForOnLoad(false, listener);
      return;
    }

    if (mFullscreenPlayerPresentationChangeProgressListener != null) {
      if (listener != null) {
        listener.onFullscreenPlayerPresentationTriedToInterrupt();
      }
      return;
    }

    if (isBeingPresentedFullscreen()) {
      if (listener != null) {
        mFullscreenPlayerPresentationChangeProgressListener = listener;
      }

      mFullscreenPlayer.dismiss();
    } else {
      if (listener != null) {
        listener.onFullscreenPlayerDidDismiss();
      }
    }
  }

  private void saveFullscreenPlayerStateForOnLoad(boolean requestedIsPresentedFullscreen, FullscreenVideoPlayerPresentationChangeProgressListener listener) {
    mShouldShowFullscreenPlayerOnLoad = requestedIsPresentedFullscreen;
    if (mFullscreenVideoPlayerPresentationOnLoadChangeListener != null) {
      mFullscreenVideoPlayerPresentationOnLoadChangeListener.onFullscreenPlayerPresentationInterrupted();
    }
    mFullscreenVideoPlayerPresentationOnLoadChangeListener = listener;
  }

  @Override
  public void onFullscreenPlayerWillPresent() {
    callFullscreenCallbackWithUpdate(VideoViewManager.FullscreenPlayerUpdate.FULLSCREEN_PLAYER_WILL_PRESENT);

    if (mFullscreenPlayerPresentationChangeProgressListener != null) {
      mFullscreenPlayerPresentationChangeProgressListener.onFullscreenPlayerWillPresent();
    }
  }

  @Override
  public void onFullscreenPlayerDidPresent() {
    mMediaController.updateControls();
    callFullscreenCallbackWithUpdate(VideoViewManager.FullscreenPlayerUpdate.FULLSCREEN_PLAYER_DID_PRESENT);

    if (mFullscreenPlayerPresentationChangeProgressListener != null) {
      mFullscreenPlayerPresentationChangeProgressListener.onFullscreenPlayerDidPresent();
      mFullscreenPlayerPresentationChangeProgressListener = null;
    }
  }

  @Override
  public void onFullscreenPlayerWillDismiss() {
    callFullscreenCallbackWithUpdate(VideoViewManager.FullscreenPlayerUpdate.FULLSCREEN_PLAYER_WILL_DISMISS);

    if (mFullscreenPlayerPresentationChangeProgressListener != null) {
      mFullscreenPlayerPresentationChangeProgressListener.onFullscreenPlayerWillDismiss();
    }
  }

  @Override
  public void onFullscreenPlayerDidDismiss() {
    mMediaController.updateControls();
    callFullscreenCallbackWithUpdate(VideoViewManager.FullscreenPlayerUpdate.FULLSCREEN_PLAYER_DID_DISMISS);

    if (mFullscreenPlayerPresentationChangeProgressListener != null) {
      mFullscreenPlayerPresentationChangeProgressListener.onFullscreenPlayerDidDismiss();
      mFullscreenPlayerPresentationChangeProgressListener = null;
    }
  }

  private void callFullscreenCallbackWithUpdate(VideoViewManager.FullscreenPlayerUpdate update) {
    Bundle event = new Bundle();
    event.putInt("fullscreenUpdate", update.getValue());
    event.putBundle("status", getStatus().toBundle());
    mEventEmitter.emit(getReactId(), VideoViewManager.Events.EVENT_FULLSCREEN_PLAYER_UPDATE.toString(), event);
  }

  // Prop setting

  public void setParams(final ReadableArguments params, final Promise promise) {
    mParamsToSet = mParamsToSet.update(params);
    if (mPlayerManager != null) {
      mPlayerManager.setParams(params, promise);
    } else if (promise != null) {
      promise.resolve(new Params());
    }
  }

  public Status getStatus() {
    return mPlayerManager == null ? new Status() : mPlayerManager.getStatus();
  }

  private boolean shouldUseNativeControls() {
    if (mOverridingUseNativeControls != null) {
      return mOverridingUseNativeControls;
    }

    return mUseNativeControls;
  }

  void setOverridingUseNativeControls(final Boolean useNativeControls) {
    mOverridingUseNativeControls = useNativeControls;
    maybeUpdateMediaControllerForUseNativeControls();
  }

  void setUseNativeControls(final boolean useNativeControls) {
    mUseNativeControls = useNativeControls;
    maybeUpdateMediaControllerForUseNativeControls();
  }

  public void setSource(final Source source, final ReadableArguments initialParams, final Promise promise) {
    if (mPlayerManager != null) {
      mParamsToSet = mPlayerManager.getParams();
      mPlayerManager.release();
      mPlayerManager = null;
      mIsLoaded = false;
    }

    if (initialParams != null) {
      mParamsToSet = new Params().update(initialParams);
    }

    final String uriString = source != null ? source.getUri() : null;

    if (uriString == null) {
      if (promise != null) {
        promise.resolve(new Params());
      }
      return;
    }

    mEventEmitter.emit(getReactId(), VideoViewManager.Events.EVENT_LOAD_START.toString(), new Bundle());

    // TODO: WHAT THE HECK IS THAT?!
//    final Bundle statusToInitiallySet = new Bundle();
//    statusToInitiallySet.putAll(mStatusToSet);
//    mStatusToSet = new Bundle();
//
//    mPlayerManager = PlayerManager.createUnloadedPlayerData(mAVModule, getContext(), source, statusToInitiallySet);
//
//    mPlayerManager.setErrorListener(error -> {
//      unloadPlayerAndMediaController();
//      callOnError(error);
//    });
//    mPlayerManager.setVideoSizeUpdateListener(videoWidthHeight -> {
//      mVideoTextureView.scaleVideoSize(videoWidthHeight, mResizeMode);
//      mVideoWidthHeight = videoWidthHeight;
//      callOnReadyForDisplay(videoWidthHeight);
//    });
//
//    mPlayerManager.setFullscreenPresenter(this);
//
//    mPlayerManager.load(statusToInitiallySet, new PlayerManager.LoadCompletionListener() {
//      @Override
//      public void onLoadSuccess(final PlayerStatus status) {
//        mIsLoaded = true;
//        mVideoTextureView.scaleVideoSize(mPlayerManager.getVideoWidthHeight(), mResizeMode);
//
//        if (mVideoTextureView.isAttachedToWindow()) {
//          mPlayerManager.setSurface(mVideoTextureView.getSurface());
//        }
//
//        if (promise != null) {
//          promise.resolve(status.toBundle());
//        }
//
//        mPlayerManager.setStatusUpdateListener(mStatusUpdateListener);
//        mMediaController.setMediaPlayer(new PlayerControl(mPlayerManager));
//        mMediaController.setAnchorView(VideoView.this);
//        maybeUpdateMediaControllerForUseNativeControls(false);
//        mEventEmitter.emit(getReactId(), VideoViewManager.Events.EVENT_LOAD.toString(), status);
//        // Execute the fullscreen player state change requested before the video loaded
//        if (mFullscreenVideoPlayerPresentationOnLoadChangeListener != null) {
//          FullscreenVideoPlayerPresentationChangeProgressListener listener = mFullscreenVideoPlayerPresentationOnLoadChangeListener;
//          mFullscreenVideoPlayerPresentationOnLoadChangeListener = null;
//          if (mShouldShowFullscreenPlayerOnLoad) {
//            ensureFullscreenPlayerIsPresented(listener);
//          } else {
//            ensureFullscreenPlayerIsDismissed(listener);
//          }
//        }
//        callOnReadyForDisplay(mVideoWidthHeight);
//      }
//
//      @Override
//      public void onLoadError(final String error) {
//        if (mFullscreenVideoPlayerPresentationOnLoadChangeListener != null) {
//          mFullscreenVideoPlayerPresentationOnLoadChangeListener.onFullscreenPlayerPresentationError(error);
//          mFullscreenVideoPlayerPresentationOnLoadChangeListener = null;
//        }
//        mShouldShowFullscreenPlayerOnLoad = false;
//
//        unloadPlayerAndMediaController();
//        if (promise != null) {
//          promise.reject("E_VIDEO_NOTCREATED", error);
//        }
//        callOnError(error);
//      }
//    });
  }

  void setResizeMode(final ScalableType resizeMode) {
    mResizeMode = resizeMode;
    if (mPlayerManager != null) {
      mVideoTextureView.scaleVideoSize(mPlayerManager.getVideoWidthHeight(), mResizeMode);
    }
  }

  // View

  private int getReactId() {
    return mVideoViewWrapper.getId();
  }

  @SuppressLint("ClickableViewAccessibility")
  @Override
  public boolean onTouchEvent(final MotionEvent event) {
    if (shouldUseNativeControls() && mMediaController != null) {
      mMediaController.show();
    }
    return super.onTouchEvent(event);
  }

  @Override
  @SuppressLint("DrawAllocation")
  protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    super.onLayout(changed, left, top, right, bottom);

    if (changed && mPlayerManager != null) {
      mVideoTextureView.scaleVideoSize(mPlayerManager.getVideoWidthHeight(), mResizeMode);
    }
  }

  // TextureView

  public void tryUpdateVideoSurface(Surface surface) {
    if (mPlayerManager != null) {
      mPlayerManager.setSurface(surface);
    }
  }

  // AudioEventHandler

  @Override
  public void pauseImmediately() {
    if (mPlayerManager != null) {
      mPlayerManager.pauseImmediately();
    }
  }

  @Override
  public boolean requiresAudioFocus() {
    return mPlayerManager != null && mPlayerManager.requiresAudioFocus();
  }

  @Override
  public void updateVolumeMuteAndDuck() {
    if (mPlayerManager != null) {
      mPlayerManager.updateVolumeMuteAndDuck();
    }
  }

  @Override
  public void handleAudioFocusInterruptionBegan() {
    if (mPlayerManager != null) {
      mPlayerManager.handleAudioFocusInterruptionBegan();
    }
  }

  @Override
  public void handleAudioFocusGained() {
    if (mPlayerManager != null) {
      mPlayerManager.handleAudioFocusGained();
    }
  }

  @Override
  public void onPause() {
    if (mPlayerManager != null) {
      ensureFullscreenPlayerIsDismissed();
      mPlayerManager.onPause();
    }
  }

  @Override
  public void onResume() {
    if (mPlayerManager != null) {
      mPlayerManager.onResume();
    }
  }

  // FullscreenPresenter

  @Override
  public boolean isBeingPresentedFullscreen() {
    return mFullscreenPlayer.isShowing();
  }

  @Override
  public void setFullscreenMode(boolean isFullscreen) {
    if (isFullscreen) {
      ensureFullscreenPlayerIsPresented();
    } else {
      ensureFullscreenPlayerIsDismissed();
    }
  }
}
