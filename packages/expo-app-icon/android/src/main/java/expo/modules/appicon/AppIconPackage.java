package expo.modules.appicon;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.interfaces.InternalModule;
import org.unimodules.core.interfaces.Package;

import java.util.Collections;
import java.util.List;

public class AppIconPackage implements Package {

  @Override
  public List<ExportedModule> createExportedModules(Context context) {
    return Collections.<ExportedModule>singletonList(new AppIconModule(context));
  }

  @Override
  public List<? extends InternalModule> createInternalModules(Context context) {
    return Collections.singletonList(new AppIconManager());
  }
}
