package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import host.exp.exponent.notifications.helpers.Utils;

public class SoundModifer implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    if (Utils.isAndroidVersionBelowOreo() && notification.getBoolean("sound")) {
      builder.setDefaults(NotificationCompat.DEFAULT_SOUND);
    }
  }
}
