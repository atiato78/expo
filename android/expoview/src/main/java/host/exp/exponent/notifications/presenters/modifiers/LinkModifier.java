package host.exp.exponent.notifications.presenters.modifiers;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import java.util.UUID;

public class LinkModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    if (notification.containsKey("link")) {
      Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(notification.getString("link")));
      PendingIntent contentIntent = PendingIntent.getActivity(
          context,
          UUID.randomUUID().hashCode(),
          intent,
          PendingIntent.FLAG_UPDATE_CURRENT
      );
      builder.setContentIntent(contentIntent);
    }
  }
}
