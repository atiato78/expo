// Copyright 2015-present 650 Industries. All rights reserved.

package host.exp.exponent.experience;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Process;
import android.util.Pair;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import javax.inject.Inject;

import de.greenrobot.event.EventBus;
import host.exp.exponent.Constants;
import host.exp.exponent.ExponentManifest;
import host.exp.exponent.RNObject;
import host.exp.exponent.di.NativeModuleDepsProvider;
import host.exp.exponent.gcm.GcmRegistrationIntentService;
import host.exp.exponent.kernel.ExperienceId;
import host.exp.exponent.kernel.ExponentError;
import host.exp.exponent.kernel.ExponentErrorMessage;
import host.exp.exponent.kernel.Kernel;
import host.exp.exponent.kernel.KernelConstants;
import host.exp.exponent.kernel.services.ExpoKernelServiceRegistry;
import host.exp.exponent.utils.AsyncCondition;
import host.exp.exponent.utils.PermissionsHelper;
import host.exp.expoview.BuildConfig;
import host.exp.expoview.Exponent;

public abstract class BaseExperienceActivity extends MultipleVersionReactNativeActivity implements PermissionAwareActivity {
  private static abstract class ExperienceEvent {
    private ExperienceId mExperienceId;
    ExperienceEvent(ExperienceId experienceId) {
      this.mExperienceId = experienceId;
    }

    public ExperienceId getExperienceId() {
      return mExperienceId;
    }
  }
  public static class ExperienceForegroundedEvent extends ExperienceEvent {
    ExperienceForegroundedEvent(ExperienceId experienceId) { super(experienceId); }
  }
  public static class ExperienceBackgroundedEvent extends ExperienceEvent {
    ExperienceBackgroundedEvent(ExperienceId experienceId) { super(experienceId); }
  }
  public static class ExperienceContentLoaded extends ExperienceEvent {
    public ExperienceContentLoaded(ExperienceId experienceId) { super(experienceId); }
  }

  private static BaseExperienceActivity sVisibleActivity;

  @Inject
  Kernel mKernel;

  @Inject
  ExponentManifest mExponentManifest;

  @Inject
  protected ExpoKernelServiceRegistry mKernelServiceRegistry;

  private PermissionsHelper mPermissionsHelper;

  private long mOnResumeTime;

  public static void addError(ExponentError error) {
    sErrorQueue.add(error);

    if (sVisibleActivity != null) {
      sVisibleActivity.consumeErrorQueue();
    } else if (ErrorActivity.getVisibleActivity() != null) {
      // If ErrorActivity is already started and we get another error from RN.
      sendErrorsToErrorActivity();
    }

    // Otherwise onResume will consumeErrorQueue
  }

  // TODO: kill. just use Exponent class's activity
  public static BaseExperienceActivity getVisibleActivity() {
    return sVisibleActivity;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    mIsInForeground = true;
    mReactRootView = new RNObject("com.facebook.react.ReactRootView");

    NativeModuleDepsProvider.getInstance().inject(BaseExperienceActivity.class, this);

    if (mManifest == null) {
      mManifest = mExponentManifest.getKernelManifest();
    }

    if (mExperienceId == null) {
      mExperienceId = ExperienceId.create(mManifest.optString(ExponentManifest.MANIFEST_ID_KEY));
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    mKernel.setActivityContext(this);
    Exponent.getInstance().setCurrentActivity(this);

    sVisibleActivity = this;

    // Consume any errors that happened before onResume
    consumeErrorQueue();
    mIsInForeground = true;

    mOnResumeTime = System.currentTimeMillis();
    AsyncCondition.wait(KernelConstants.EXPERIENCE_ID_SET_FOR_ACTIVITY_KEY, new AsyncCondition.AsyncConditionListener() {
      @Override
      public boolean isReady() {
        return mExperienceId != null || BaseExperienceActivity.this instanceof HomeActivity;
      }

      @Override
      public void execute() {
        EventBus.getDefault().post(new ExperienceForegroundedEvent(mExperienceId));
      }
    });
  }

  @Override
  protected void onPause() {
    EventBus.getDefault().post(new ExperienceBackgroundedEvent(mExperienceId));
    super.onPause();

    // For some reason onPause sometimes gets called soon after onResume.
    // One symptom of this is that ReactNativeActivity.startReactInstance will
    // see isInForeground == false and not start the app.
    // 500ms should be very safe. The average time between onResume and
    // onPause when the bug happens is around 10ms.
    // This seems to happen when foregrounding the app after pressing on a notification.
    // Unclear if this is because of something we're doing during the initialization process
    // or just an OS quirk.
    long timeSinceOnResume = System.currentTimeMillis() - mOnResumeTime;
    if (timeSinceOnResume > 500) {
      mIsInForeground = false;
      if (sVisibleActivity == this) {
        sVisibleActivity = null;
      }
    }
  }

  @Override
  public void onBackPressed() {
    if (mReactInstanceManager != null && mReactInstanceManager.isNotNull() && !mIsCrashed) {
      mReactInstanceManager.call("onBackPressed");
    } else {
      moveTaskToBack(true);
    }
  }

  @Override
  public void invokeDefaultOnBackPressed() {
    moveTaskToBack(true);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();

    if (this instanceof HomeActivity) {
      // Don't want to trash the kernel instance
      return;
    }

    if (mReactInstanceManager != null && mReactInstanceManager.isNotNull()) {
      mReactInstanceManager.onHostDestroy();
      mReactInstanceManager.assign(null);
    }
    mReactRootView.assign(null);

    // Fresco leaks ReactApplicationContext
    Fresco.initialize(getApplicationContext());

    // TODO: OkHttpClientProvider leaks Activity. Clean it up.
  }

  protected void consumeErrorQueue() {
    if (sErrorQueue.isEmpty()) {
      return;
    }

    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (sErrorQueue.isEmpty()) {
          return;
        }

        Pair<Boolean, ExponentErrorMessage> result = sendErrorsToErrorActivity();
        boolean isFatal = result.first;
        ExponentErrorMessage errorMessage = result.second;

        if (!shouldShowErrorScreen(errorMessage)) {
          return;
        }

        if (!isFatal) {
          return;
        }

        if (!isDebugModeEnabled()) {
          removeViews();
          mReactInstanceManager.assign(null);
          mReactRootView.assign(null);
        }

        mIsCrashed = true;
        mIsLoading = false;

        Intent intent = new Intent(BaseExperienceActivity.this, ErrorActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        onError(intent);
        intent.putExtra(ErrorActivity.DEBUG_MODE_KEY, isDebugModeEnabled());
        intent.putExtra(ErrorActivity.USER_ERROR_MESSAGE_KEY, errorMessage.userErrorMessage());
        intent.putExtra(ErrorActivity.DEVELOPER_ERROR_MESSAGE_KEY, errorMessage.developerErrorMessage());
        startActivity(intent);

        EventBus.getDefault().post(new ExperienceDoneLoadingEvent());
      }
    });
  }

  private static Pair<Boolean, ExponentErrorMessage> sendErrorsToErrorActivity() {
    boolean isFatal = false;
    ExponentErrorMessage errorMessage = ExponentErrorMessage.developerErrorMessage("");

    synchronized (sErrorQueue) {
      while (!sErrorQueue.isEmpty()) {
        ExponentError error = sErrorQueue.remove();
        ErrorActivity.addError(error);
        if (sVisibleActivity != null) {
          sVisibleActivity.onError(error);
        }

        // Just use the last error message for now, is there a better way to do this?
        errorMessage = error.errorMessage;
        if (error.isFatal) {
          isFatal = true;
        }
      }
    }

    return new Pair<>(isFatal, errorMessage);
  }

  // Override
  public boolean isDebugModeEnabled() {
    return false;
  }

  // Override
  protected void onError(final Intent intent) {
    // Modify intent used to start ErrorActivity
  }

  // Override
  protected void onError(final ExponentError error) {
    // Called for each JS error
  }

  protected void registerForNotifications() {
    int googlePlayServicesCode = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(this);
    if (googlePlayServicesCode == ConnectionResult.SUCCESS) {
      if (!Constants.FCM_ENABLED) {
        Intent intent = new Intent(this, GcmRegistrationIntentService.class);
        startService(intent);
      }
    } else if (!BuildConfig.DEBUG) {
      // TODO: should we actually show an error or fail silently?
      // GoogleApiAvailability.getInstance().getErrorDialog(this, googlePlayServicesCode, 0).show();
    }
  }

  // for getting scope permission
  @Override
  public int checkPermission(final String permission, final int pid, final int uid) {
    int globalResult = super.checkPermission(permission, pid, uid);

    if (globalResult == PackageManager.PERMISSION_GRANTED &&
        mKernelServiceRegistry.getPermissionsKernelService().hasGrantedPermissions(permission, mExperienceId)) {
      return PackageManager.PERMISSION_GRANTED;
    } else {
      return PackageManager.PERMISSION_DENIED;
    }
  }

  // for getting global permission
  @Override
  public int checkSelfPermission(String permission) {
    return super.checkPermission(permission, Process.myPid(), Process.myUid());
  }

  @Override
  public void onRequestPermissionsResult(final int requestCode, final String permissions[], final int[] grantResults) {
    if (permissions.length > 0 && grantResults.length > 0 && mPermissionsHelper != null) {
      mPermissionsHelper.onRequestPermissionsResult(requestCode, permissions, grantResults);
      mPermissionsHelper = null;
    }
  }


  @Override
  public void requestPermissions(final String[] permissions, final int requestCode, final PermissionListener listener) {
    mPermissionsHelper = new PermissionsHelper(mExperienceId);
    mPermissionsHelper.requestPermissions(new Exponent.PermissionsListener() {
      @Override
      public void permissionsGranted() {
        listener.onRequestPermissionsResult(requestCode, permissions, arrayFilled(PackageManager.PERMISSION_GRANTED, permissions.length));
      }

      @Override
      public void permissionsDenied() {
        listener.onRequestPermissionsResult(requestCode, permissions, arrayFilled(PackageManager.PERMISSION_DENIED, permissions.length));
      }
    }, permissions, mManifest.optString(ExponentManifest.MANIFEST_NAME_KEY));
  }

  private static int[] arrayFilled(final int with, final int length) {
    int[] array = new int[length];
    for (int i = 0; i < length; i++) {
      array[i] = with;
    }
    return array;
  }
}
