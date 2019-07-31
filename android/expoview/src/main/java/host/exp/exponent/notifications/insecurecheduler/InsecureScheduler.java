package host.exp.exponent.notifications.insecurecheduler;

import android.content.Context;
import android.os.Bundle;

import java.util.HashMap;

public interface InsecureScheduler {

  void schedule(String experienceId, long elapsedTime, int notificationId, HashMap notification, final Context context);

  void cancelScheduled(String experienceId, int notificationId, final Context context);

  void cancelAllScheduled(String experienceId, final Context context);

}
