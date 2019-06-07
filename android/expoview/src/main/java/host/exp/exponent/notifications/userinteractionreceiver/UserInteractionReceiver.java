package host.exp.exponent.notifications.userinteractionreceiver;

import android.app.RemoteInput;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import host.exp.exponent.kernel.KernelConstants;
import host.exp.exponent.notifications.ExponentNotification;
import host.exp.exponent.notifications.ExponentNotificationManager;
import host.exp.exponent.notifications.NotificationActionCenter;
import host.exp.exponent.notifications.postoffice.PostOfficeProxy;

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
    String notificationObject = bundle.getString(KernelConstants.NOTIFICATION_OBJECT_KEY);
    ExponentNotification exponentNotification = ExponentNotification.fromJSONObjectString(notificationObject);
    if (exponentNotification != null) {
      // Add action type
      if (bundle.containsKey(KernelConstants.NOTIFICATION_ACTION_TYPE_KEY)) {
        exponentNotification.setActionType(bundle.getString(KernelConstants.NOTIFICATION_ACTION_TYPE_KEY));
        ExponentNotificationManager manager = new ExponentNotificationManager(context);
        manager.cancel(exponentNotification.experienceId, exponentNotification.notificationId);
      }
      // Add remote input
      Bundle remoteInput = RemoteInput.getResultsFromIntent(intent);
      if (remoteInput != null) {
        exponentNotification.setInputText(remoteInput.getString(NotificationActionCenter.KEY_TEXT_REPLY));
      }

      PostOfficeProxy.getInstance().notifyAboutUserInteraction(
          exponentNotification.experienceId,
          exponentNotification.toBundle()
      );

      return true;
    }
    return false;
  }

}
