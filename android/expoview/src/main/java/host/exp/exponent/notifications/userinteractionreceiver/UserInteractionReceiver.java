package host.exp.exponent.notifications.userinteractionreceiver;

import android.app.RemoteInput;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.NotificationManagerCompat;

import host.exp.exponent.kernel.KernelConstants;
import host.exp.exponent.notifications.ExponentNotificationManager;
import host.exp.exponent.notifications.NotificationActionCenter;
import host.exp.exponent.notifications.NotificationConstants;
import host.exp.exponent.notifications.postoffice.PostOfficeProxy;

import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_EXPERIENCE_ID_KEY;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_STICKY;

public class UserInteractionReceiver {

  private static volatile UserInteractionReceiver mInstance = null;

  private UserInteractionReceiver() { }

  public synchronized static UserInteractionReceiver getInstance() {
    if (mInstance == null) {
      mInstance = new UserInteractionReceiver();
    }
    return mInstance;
  }

  public static boolean onIntent(Intent intent, Context context) {
    Bundle bundle = intent.getExtras();
    Bundle notification = bundle.getBundle(KernelConstants.NOTIFICATION_OBJECT_KEY);

    if (notification == null) {
      return false;
    }

    String experienceId = notification.getString(NOTIFICATION_EXPERIENCE_ID_KEY);
    Integer notificationIntId = notification.getInt("notificationIntId");

    if (!notification.getBoolean(NOTIFICATION_STICKY)) {
      ExponentNotificationManager manager = new ExponentNotificationManager(context);
      manager.cancel(experienceId, notificationIntId);
    }

    // Add action type
    if (bundle.containsKey(KernelConstants.NOTIFICATION_ACTION_TYPE_KEY)) {
      notification.putString(
          NotificationConstants.NOTIFICATION_ACTION_TYPE,
          bundle.getString(KernelConstants.NOTIFICATION_ACTION_TYPE_KEY)
      );
    }
    // Add remote input
    Bundle remoteInput = RemoteInput.getResultsFromIntent(intent);
    if (remoteInput != null) {
      notification.putString(
          NotificationConstants.NOTIFICATION_INPUT_TEXT,
          remoteInput.getString(NotificationActionCenter.KEY_TEXT_REPLY)
      );
    }

    PostOfficeProxy.getInstance().notifyAboutUserInteraction(
        experienceId,
        notification
    );

    return true;
  }

}
