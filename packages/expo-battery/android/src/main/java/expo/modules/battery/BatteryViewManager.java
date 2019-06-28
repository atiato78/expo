package expo.modules.battery;

import android.content.Context;

import java.util.Arrays;
import java.util.List;

import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.ViewManager;
import org.unimodules.core.interfaces.ModuleRegistryConsumer;

public class BatteryViewManager extends ViewManager<BatteryView> implements ModuleRegistryConsumer {
  private static final String TAG = "ExpoBatteryView";

  private ModuleRegistry mModuleRegistry;

  @Override
  public String getName() {
    return TAG;
  }

  @Override
  public BatteryView createViewInstance(Context context) {
    return new BatteryView(context, mModuleRegistry);
  }

  @Override
  public ViewManagerType getViewManagerType() {
    return ViewManagerType.SIMPLE;
  }

  @Override
  public List<String> getExportedEventNames() {
    return Arrays.asList("onSomethingHappened");
  }

  @Override
  public void setModuleRegistry(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
  }
}
