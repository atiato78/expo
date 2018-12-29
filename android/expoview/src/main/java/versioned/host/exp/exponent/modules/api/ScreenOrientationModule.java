package versioned.host.exp.exponent.modules.api;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.util.DisplayMetrics;
import android.view.Surface;
import android.view.WindowManager;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nullable;

public class ScreenOrientationModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private @Nullable
  Integer mInitialOrientation = null;

  public ScreenOrientationModule(ReactApplicationContext reactContext) {
    super(reactContext);

    reactContext.addLifecycleEventListener(this);
  }

  @Override
  public String getName() {
    return "ExpoScreenOrientation";
  }

  //TODO: think abt this
  @Override
  public void onHostResume() {
    Activity activity = getCurrentActivity();
    if (activity != null && mInitialOrientation == null) {
      mInitialOrientation = activity.getRequestedOrientation();
    }
  }

  @Override
  public void onHostPause() {

  }

  @Override
  public void onHostDestroy() {

  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();

    Activity activity = getCurrentActivity();
    if (activity != null && mInitialOrientation != null) {
      activity.setRequestedOrientation(mInitialOrientation);
    }
  }

  @ReactMethod
  public void lockAsync(String orientationLockStr, Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(ANDROID_NO_ACTIVITY, ANDROID_NO_ACTIVITY_MSG);
      return;
    }

    try {
      OrientationLock orientationLock = OrientationLock.valueOf(orientationLockStr);
      int orientationAttr = orientationLockJSToNative(orientationLock);
      activity.setRequestedOrientation(orientationAttr);
    } catch (IllegalArgumentException e) {
      promise.reject("ERR_SCREEN_ORIENTATION_INVALID_ORIENTATION_LOCK", "An invalid OrientationLock was passed in: " + orientationLockStr);
      return;
    } catch (Exception e) {
      promise.reject(GENERIC_ANDROID_ERROR, e.toString());
      return;
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void lockPlatformAsync(int orientationAttr, Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(ANDROID_NO_ACTIVITY, ANDROID_NO_ACTIVITY_MSG);
      return;
    }

    try {
      activity.setRequestedOrientation(orientationAttr);
    } catch (Exception e) {
      promise.reject(GENERIC_ANDROID_ERROR, e.toString());
      return;
    }
    promise.resolve(null);

  }

  @ReactMethod
  public void unlockAsync(Promise promise) {
    lockAsync(OrientationLock.DEFAULT.toString(), promise);
  }

  @ReactMethod
  public void getOrientationAsync(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(ANDROID_NO_ACTIVITY, ANDROID_NO_ACTIVITY_MSG);
      return;
    }

    try {
      Orientation orientation = getScreenOrientation(activity);
      promise.resolve(orientation.toString());
    } catch (Exception e) {
      promise.reject(GENERIC_ANDROID_ERROR, e.toString());
    }
  }

  @ReactMethod
  public void getOrientationLockAsync(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(ANDROID_NO_ACTIVITY, ANDROID_NO_ACTIVITY_MSG);
      return;
    }

    int orientationAttr = activity.getRequestedOrientation();
    OrientationLock orientationLock = orientationLockNativeToJS(orientationAttr);
    promise.resolve(orientationLock.toString());
  }

  @ReactMethod
  public void getPlatformOrientationLockAsync(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(ANDROID_NO_ACTIVITY, ANDROID_NO_ACTIVITY_MSG);
      return;
    }

    promise.resolve(activity.getRequestedOrientation());
  }

  // https://stackoverflow.com/questions/10380989/how-do-i-get-the-current-orientation-activityinfo-screen-orientation-of-an-a
  // Will not work in all cases as surface rotation is not standardized across android devices, but this is best effort
  private Orientation getScreenOrientation(Activity activity) {
    WindowManager windowManager = activity.getWindowManager();
    int rotation = windowManager.getDefaultDisplay().getRotation();
    DisplayMetrics dm = new DisplayMetrics();
    windowManager.getDefaultDisplay().getMetrics(dm);
    int width = dm.widthPixels;
    int height = dm.heightPixels;
    Orientation orientation;
    // if the device's natural orientation is portrait:
    if ((rotation == Surface.ROTATION_0
        || rotation == Surface.ROTATION_180) && height > width ||
        (rotation == Surface.ROTATION_90
            || rotation == Surface.ROTATION_270) && width > height) {
      switch (rotation) {
        case Surface.ROTATION_0:
          orientation = Orientation.PORTRAIT_UP;
          break;
        case Surface.ROTATION_90:
          orientation = Orientation.LANDSCAPE_LEFT;
          break;
        case Surface.ROTATION_180:
          orientation = Orientation.PORTRAIT_DOWN;
          break;
        case Surface.ROTATION_270:
          orientation = Orientation.LANDSCAPE_RIGHT;
          break;
        default:
          orientation = Orientation.UNKNOWN;
          break;
      }
    }

    // if the device's natural orientation is landscape or if the device
    // is square:
    else {
      switch (rotation) {
        case Surface.ROTATION_0:
          orientation = Orientation.LANDSCAPE_LEFT;
          break;
        case Surface.ROTATION_90:
          orientation = Orientation.PORTRAIT_UP;
          break;
        case Surface.ROTATION_180:
          orientation = Orientation.LANDSCAPE_RIGHT;
          break;
        case Surface.ROTATION_270:
          orientation = Orientation.PORTRAIT_DOWN;
          break;
        default:
          orientation = Orientation.UNKNOWN;
          break;
      }
    }
    return orientation;
  }

  // TODO: is there a shared place to put these things
  static final String ANDROID_NO_ACTIVITY = "ANDROID_NO_ACTIVITY";
  static final String ANDROID_NO_ACTIVITY_MSG = "There is no current activity available.";
  static final String GENERIC_ANDROID_ERROR = "GENERIC_ANDROID_ERROR";

  public enum Orientation {
    PORTRAIT_UP,
    PORTRAIT_DOWN,
    LANDSCAPE_LEFT,
    LANDSCAPE_RIGHT,
    UNKNOWN;
  }

  public enum OrientationLock {
    DEFAULT,
    ALL,
    PORTRAIT,
    PORTRAIT_UP,
    PORTRAIT_DOWN,
    LANDSCAPE,
    LANDSCAPE_LEFT,
    LANDSCAPE_RIGHT,
    OTHER,
    ALL_BUT_UPSIDE_DOWN; // deprecated
  }

  private OrientationLock orientationLockNativeToJS(int orientationAttr) {
    switch (orientationAttr) {
      case ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED:
        return OrientationLock.DEFAULT;
      case ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR:
        return OrientationLock.ALL;
      case ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT:
        return OrientationLock.PORTRAIT;
      case ActivityInfo.SCREEN_ORIENTATION_PORTRAIT:
        return OrientationLock.PORTRAIT_UP;
      case ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT:
        return OrientationLock.PORTRAIT_DOWN;
      case ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE:
        return OrientationLock.LANDSCAPE;
      case ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE:
        return OrientationLock.LANDSCAPE_LEFT;
      case ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE:
        return OrientationLock.LANDSCAPE_RIGHT;
      default:
        return OrientationLock. OTHER;
    }
  }

  private int orientationLockJSToNative(OrientationLock orientationLock) {
    switch (orientationLock) {
      case DEFAULT:
        return ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
      case ALL:
        return ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR;
      case ALL_BUT_UPSIDE_DOWN:
        return ActivityInfo.SCREEN_ORIENTATION_SENSOR;
      case PORTRAIT:
        return ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
      case PORTRAIT_UP:
        return ActivityInfo.SCREEN_ORIENTATION_PORTRAIT;
      case PORTRAIT_DOWN:
        return ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
      case LANDSCAPE:
        return ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
      case LANDSCAPE_LEFT:
        return ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
      case LANDSCAPE_RIGHT:
        return ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
      default:
        throw new IllegalArgumentException("OrientationLock " + orientationLock.toString() + " is not mapped to a native Android orientation attr");
    }
  }
}

