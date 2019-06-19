package expo.modules.ota;

import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.errors.UnsupportedMethodException;
import org.unimodules.core.interfaces.InternalModule;
import org.unimodules.interfaces.updates.BundleResponse;
import org.unimodules.interfaces.updates.UpdateAvailabilityListener;
import org.unimodules.interfaces.updates.Updates;

import java.util.Collections;
import java.util.List;

public class UpdatesService implements Updates, InternalModule {

  public UpdatesService() {
  }

  @Override
  public List<? extends Class> getExportedInterfaces() {
    return Collections.singletonList(Updates.class);
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {

  }

  @Override
  public void onDestroy() {

  }

  @Override
  public void reloadVisibleBundle(boolean forceCache) throws UnsupportedMethodException {
    throw new UnsupportedMethodException("Standalone apps cannot reload visible experience!");
  }

  @Override
  public boolean updatesEnabled() {
    return true;
  }

  @Override
  public void isUpdateAvailable(UpdateAvailabilityListener listener) {

  }

  @Override
  public void fetchBundle(BundleResponse bundleResponse) {

  }
}
