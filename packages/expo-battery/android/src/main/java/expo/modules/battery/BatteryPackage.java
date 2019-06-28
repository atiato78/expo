package expo.modules.battery;

import android.content.Context;

import java.util.Collections;
import java.util.List;

import org.unimodules.core.BasePackage;
import org.unimodules.core.ExportedModule;
import org.unimodules.core.ViewManager;

public class BatteryPackage extends BasePackage {
  @Override
  public List<ExportedModule> createExportedModules(Context context) {
    return Collections.singletonList((ExportedModule) new BatteryModule(context));
  }

  @Override
  public List<ViewManager> createViewManagers(Context context) {
    return Collections.singletonList((ViewManager) new BatteryViewManager());
  }
}
