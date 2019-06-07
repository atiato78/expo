// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.appicon;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;

public class AppIconModule extends ExportedModule {
  private static final String NAME = "AppIconAwake";

  public AppIconModule(Context context) {
    super(context);
  }

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    constants.put("isSupported", false);
    // TODO: Bacon: Add Android API
    constants.put("icons", new Bundle());
    return constants;
  }

  // TODO: Bacon: Add Android API

  // @ExpoMethod
  // public void setIconAsync(String name, final Promise promise) {
  // }
  // @ExpoMethod
  // public void getIconAsync(Promise promise) {
  // }
}
