package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import host.exp.expoview.R;

public class IconModifier implements NotificationModifierInterface {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    // only for tests and it should be reimplemented afterwards
    builder.setSmallIcon(R.drawable.notification_icon);
  }
}
