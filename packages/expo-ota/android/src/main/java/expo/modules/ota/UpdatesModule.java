package expo.modules.ota;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.interfaces.updates.BundleResponse;
import org.unimodules.interfaces.updates.UpdateAvailabilityListener;
import org.unimodules.interfaces.updates.Updates;

public class UpdatesModule extends ExportedModule {

  private static final String TAG = UpdatesModule.class.getSimpleName();
  private Updates mUpdates;

  public UpdatesModule(Context context) {
    super(context);
  }

  @Override
  public String getName() {
    return "ExpoOta";
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mUpdates = moduleRegistry.getModule(Updates.class);
  }

  @ExpoMethod
  public void reload(Promise promise) {
    mUpdates.reloadVisibleBundle(false);
  }

  @ExpoMethod
  public void reloadFromCache(Promise promise) {
    mUpdates.reloadVisibleBundle(true);
  }

  @ExpoMethod
  public void checkForUpdateAsync(final Promise promise) {
    if (!mUpdates.updatesEnabled()) {
      rejectWithErrorCode("E_CHECK_UPDATE_FAILED", "Remote updates are disabled!", promise);
    } else {
      mUpdates.isUpdateAvailable(new UpdateAvailabilityListener() {
        @Override
        public void updateAvailable(Object updateInfo) {
          promise.resolve(updateInfo);
        }

        @Override
        public void updateUnavailable() {
          promise.resolve(false);
        }

        @Override
        public void onError(Exception e) {
          promise.reject("E_FETCH_MANIFEST_FAILED", e);
        }

        @Override
        public void onError(String e) {
          promise.reject("E_FETCH_MANIFEST_FAILED", e);
        }
      });
    }
  }

  @ExpoMethod
  public void fetchUpdateAsync(final Promise promise) {
    if (!mUpdates.updatesEnabled()) {
      rejectWithErrorCode("E_FETCH_UPDATE_FAILED", "OTA updates are disabled!", promise);
    }
    mUpdates.fetchBundle(new BundleResponse() {
      @Override
      public void onError(String code, String message) {
        rejectWithErrorCode(code, message, promise);
      }

      @Override
      public void bundleUpdateUnavailable() {
        promise.resolve(null);
      }

      @Override
      public void bundleDownloaded(Object resolveInfo) {
        promise.resolve(resolveInfo);
      }
    });
  }

  private void rejectWithErrorCode(String code, String message, Promise promise) {
    promise.reject(code, message);
  }

  private void rejectWithErrorCode(String code, String message, Throwable e, Promise promise) {
    promise.reject(code, message, e);
  }

}
