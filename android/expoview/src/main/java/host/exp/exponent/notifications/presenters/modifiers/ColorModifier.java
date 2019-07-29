package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_COLOR;

public class ColorModifier implements NotificationModifier {

  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    if (notification.containsKey(NOTIFICATION_COLOR)) {
      builder.setColor(notification.getInt(NOTIFICATION_COLOR));
    }
  }
}
