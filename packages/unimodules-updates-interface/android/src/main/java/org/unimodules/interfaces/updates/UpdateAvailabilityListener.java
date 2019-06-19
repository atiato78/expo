package org.unimodules.interfaces.updates;

import org.json.JSONObject;

public interface UpdateAvailabilityListener {

  void updateAvailable(Object updateInfo);

  void updateUnavailable();

  void onError(Exception e);

  void onError(String e);

}
