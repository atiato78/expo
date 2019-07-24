package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

public class BodyModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    if (notification.containsKey("body")) {
      builder.setContentText((String) notification.get("body"));
      builder.setStyle(new NotificationCompat.BigTextStyle().
          bigText((String) notification.get("body")));
    }
  }
}
