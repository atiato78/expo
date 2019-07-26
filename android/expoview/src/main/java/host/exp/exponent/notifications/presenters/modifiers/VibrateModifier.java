package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

public class VibrateModifier implements  NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceID) {
    if (notification.containsKey("vibrate")) {
      builder.setVibrate(notification.getLongArray("vibrate"));
    }
  }
}
