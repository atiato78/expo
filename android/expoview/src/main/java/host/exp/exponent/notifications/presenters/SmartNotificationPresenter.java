package host.exp.exponent.notifications.presenters;

import android.content.Context;
import android.os.Bundle;

import host.exp.exponent.notifications.postoffice.PostOfficeProxy;

public class SmartNotificationPresenter implements NotificationPresenterInterface {

  private static boolean isForeground = false;

  private NotificationPresenterInterface mNotificationPresenter = new NotificationPresenter();

  @Override
  public void presentNotification(Context context, String experienceId, Bundle notification, int notificationId) {
    if (isForeground) {
      PostOfficeProxy.getInstance().sendForegroundNotification(experienceId, notification);
    } else {
      mNotificationPresenter.presentNotification(context, experienceId, notification, notificationId);
    }
  }

  public static void toggleState() {
    isForeground = !isForeground;
  }

  public static void setBackground() {
    isForeground = false;
  }

}
