package host.exp.exponent.notifications.presenters.modifiers;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import java.util.UUID;

import host.exp.exponent.kernel.KernelConstants;

public class IntentModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    Class activityClass = KernelConstants.MAIN_ACTIVITY_CLASS;
    Intent intent = new Intent(context, activityClass);
    intent.putExtra(KernelConstants.NOTIFICATION_OBJECT_KEY, notification);

    PendingIntent contentIntent = PendingIntent.getActivity(
        context,
        UUID.randomUUID().hashCode(),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT
    );
    builder.setContentIntent(contentIntent);
  }
}
