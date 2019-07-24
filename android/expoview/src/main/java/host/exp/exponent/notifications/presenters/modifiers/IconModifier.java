package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import host.exp.expoview.R;

public class IconModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    builder.setSmallIcon(R.drawable.shell_notification_icon);
    // TODO: download from notification.url if possible
  }
}
