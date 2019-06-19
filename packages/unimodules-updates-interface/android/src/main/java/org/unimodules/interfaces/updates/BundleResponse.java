package org.unimodules.interfaces.updates;

import android.os.Bundle;

public interface BundleResponse {

  void onError(String code, String message);

  void bundleUpdateUnavailable();


  void bundleDownloaded(Object resolveInfo);

}
