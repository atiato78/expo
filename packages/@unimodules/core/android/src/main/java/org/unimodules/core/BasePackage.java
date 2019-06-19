package org.unimodules.core;

import android.content.Context;

import org.unimodules.core.interfaces.InternalModule;
import org.unimodules.core.interfaces.Package;
import org.unimodules.core.interfaces.SingletonModule;

import java.util.Collections;
import java.util.List;

// This class should not be used. Implement org.unimodules.core.interfaces.Package instead of extending this class
// Remove once no one extends it.
public class BasePackage implements Package {
  @Override
  public List<? extends InternalModule> createInternalModules(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<? extends ExportedModule> createExportedModules(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<? extends ViewManager> createViewManagers(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<? extends SingletonModule> createSingletonModules(Context context) {
    return Collections.emptyList();
  }
}
