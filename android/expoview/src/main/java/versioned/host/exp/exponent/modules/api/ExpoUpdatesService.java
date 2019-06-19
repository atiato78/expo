package versioned.host.exp.exponent.modules.api;

import android.content.Context;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.errors.UnsupportedMethodException;
import org.unimodules.core.interfaces.InternalModule;
import org.unimodules.interfaces.updates.BundleResponse;
import org.unimodules.interfaces.updates.UpdateAvailabilityListener;
import org.unimodules.interfaces.updates.Updates;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import host.exp.exponent.AppLoader;
import host.exp.exponent.Constants;
import host.exp.exponent.ExponentManifest;
import host.exp.exponent.di.NativeModuleDepsProvider;
import host.exp.exponent.kernel.KernelConstants;
import host.exp.exponent.kernel.KernelProvider;
import host.exp.exponent.storage.ExponentSharedPreferences;
import host.exp.expoview.Exponent;

public class ExpoUpdatesService implements Updates, InternalModule {

  private Map<String, Object> mExperienceProperties;
  private JSONObject mManifest;

  private DeviceEventManagerModule.RCTDeviceEventEmitter mEventEmitter;

  @Inject
  ExponentManifest mExponentManifest;

  @Inject
  ExponentSharedPreferences mExponentSharedPreferences;

  public ExpoUpdatesService(Context context, Map<String, Object> experienceProperties, JSONObject manifest) {
    NativeModuleDepsProvider.getInstance().inject(ExpoUpdatesService.class, this);
    mExperienceProperties = experienceProperties;
    mManifest = manifest;
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mEventEmitter = moduleRegistry.getModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
  }

  @Override
  public void reloadVisibleBundle(boolean forceCache) throws UnsupportedMethodException {
    KernelProvider.getInstance().reloadVisibleExperience((String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY), forceCache);
  }

  @Override
  public boolean updatesEnabled() {
    return Constants.ARE_REMOTE_UPDATES_ENABLED && !ExponentManifest.isDebugModeEnabled(mManifest);
  }

  @Override
  public void isUpdateAvailable(UpdateAvailabilityListener listener) {
    try {
      String manifestUrl = (String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY);
      final String currentRevisionId = mManifest.getString(ExponentManifest.MANIFEST_REVISION_ID_KEY);

      mExponentManifest.fetchManifest(manifestUrl, new ExponentManifest.ManifestListener() {
        @Override
        public void onCompleted(JSONObject manifest) {
          try {
            String newRevisionId = manifest.getString(ExponentManifest.MANIFEST_REVISION_ID_KEY);
            if (currentRevisionId.equals(newRevisionId)) {
              listener.updateUnavailable();
            } else {
              listener.updateAvailable(manifest.toString());
            }
          } catch (Exception e) {
            onError(e);
          }
        }

        @Override
        public void onError(Exception e) {
          listener.onError(e);
        }

        @Override
        public void onError(String e) {
          listener.onError(e);
        }
      }, false);
    }catch (Exception e) {
      listener.onError(e);
    }
  }

  @Override
  public void fetchBundle(BundleResponse response) {
    String manifestUrl = (String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY);
    final String currentRevisionId = mManifest.optString(ExponentManifest.MANIFEST_REVISION_ID_KEY, "");
    mExponentManifest.fetchManifest(manifestUrl, new ExponentManifest.ManifestListener() {
      @Override
      public void onCompleted(JSONObject manifest) {
        try {
          String newRevisionId = manifest.getString(ExponentManifest.MANIFEST_REVISION_ID_KEY);
          if (currentRevisionId.equals(newRevisionId)) {
            // no update available
            response.bundleUpdateUnavailable();
            sendEvent(AppLoader.UPDATE_NO_UPDATE_AVAILABLE_EVENT);
            return;
          }
        } catch (Exception e) {
        }
        sendEventToJS(AppLoader.UPDATE_DOWNLOAD_START_EVENT, null);
        fetchJSBundleAsync(manifest, response);
      }

      @Override
      public void onError(Exception e) {
        String code = "E_FETCH_MANIFEST_FAILED";
        String message = "Unable to fetch updated manifest";
        response.onError(code, message);
        sendError(code, message, e);
      }

      @Override
      public void onError(String e) {
        String code = "E_FETCH_MANIFEST_FAILED";
        String message = "Unable to fetch updated manifest";
        response.onError(code, message);
        sendError(code, message, new Exception(e));
      }
    });

  }

  private void fetchJSBundleAsync(final JSONObject manifest, final BundleResponse response) {
    try {
      String bundleUrl = manifest.getString(ExponentManifest.MANIFEST_BUNDLE_URL_KEY);
      String id = manifest.getString(ExponentManifest.MANIFEST_ID_KEY);
      String sdkVersion = manifest.getString(ExponentManifest.MANIFEST_SDK_VERSION_KEY);

      Exponent.getInstance().loadJSBundle(manifest, bundleUrl, Exponent.getInstance().encodeExperienceId(id), sdkVersion, new Exponent.BundleListener() {
        @Override
        public void onError(Exception e) {
          String code = "E_FETCH_BUNDLE_FAILED";
          String message = "Failed to fetch new update";
          response.onError(code, message);
          sendError(code, message, e);
        }

        @Override
        public void onBundleLoaded(String localBundlePath) {
          String manifestString = manifest.toString();
          WritableMap params = Arguments.createMap();
          params.putString("manifestString", manifestString);

          sendEventToJS(AppLoader.UPDATE_DOWNLOAD_FINISHED_EVENT, params);
          response.bundleDownloaded(manifestString);

          mExponentSharedPreferences.updateSafeManifest((String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY), manifest);
        }
      });
    } catch (Exception e) {
      String code = "E_FETCH_BUNDLE_FAILED";
      String message = "Failed to fetch new update";
      response.onError(code, message);
      sendError(code, message, e);
    }
  }

  private void sendError(String code, String message) {
    WritableMap params = Arguments.createMap();
    params.putString("message", message);
    sendEventToJS(AppLoader.UPDATE_ERROR_EVENT, params);
  }

  private void sendError(String code, String message, Throwable e) {
    WritableMap params = Arguments.createMap();
    params.putString("message", message);
    sendEventToJS(AppLoader.UPDATE_ERROR_EVENT, params);
  }

  private void sendEvent(String eventName) {
    sendEventToJS(eventName, null);
  }

  private void sendEventToJS(String eventName, WritableMap params) {
    WritableMap paramsToSend = params;
    if (params == null) {
      paramsToSend = Arguments.createMap();
    }
    paramsToSend.putString("type", eventName);
    mEventEmitter.emit(AppLoader.UPDATES_EVENT_NAME, paramsToSend);
  }

  @Override
  public List<? extends Class> getExportedInterfaces() {
    return Collections.singletonList(Updates.class);
  }
}
