package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import host.exp.exponent.notifications.helpers.Utils;

import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_PRIORITY;

public class ImportanceModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    if (notification.containsKey(NOTIFICATION_PRIORITY) && Utils.isAndroidVersionBelowOreo()) {
      int priority = notification.getInt(NOTIFICATION_PRIORITY);
      // priority should be a number from {-2, -1, 0, 1, 2}
      builder.setPriority(priority);
    }
  }
}
