package org.unimodules.interfaces.updates;


import org.unimodules.core.errors.UnsupportedMethodException;

public interface Updates {

  void reloadVisibleBundle(boolean forceCache) throws UnsupportedMethodException;

  boolean updatesEnabled();

  void isUpdateAvailable(UpdateAvailabilityListener listener);

  void fetchBundle(BundleResponse bundleResponse);

}
