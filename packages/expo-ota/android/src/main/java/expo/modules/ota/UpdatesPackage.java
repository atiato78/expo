package expo.modules.ota;

import android.content.Context;

import org.unimodules.core.BasePackage;
import org.unimodules.core.ExportedModule;
import org.unimodules.core.interfaces.InternalModule;

import java.util.Collections;
import java.util.List;

public class UpdatesPackage extends BasePackage {

  @Override
  public List<? extends InternalModule> createInternalModules(Context context) {
    return Collections.singletonList(new UpdatesService());
  }

  @Override
  public List<? extends ExportedModule> createExportedModules(Context context) {
    return Collections.singletonList(new UpdatesModule(context));
  }
}
