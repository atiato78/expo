package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import org.json.JSONObject;

import host.exp.exponent.notifications.ExponentNotificationManager;
import host.exp.exponent.notifications.helpers.Utils;

import static host.exp.exponent.notifications.NotificationHelper.createChannel;

public class ChannelModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    if (!Utils.isAndroidVersionBelowOreo()) {
      // if we don't yet have a channel matching this ID, check shared preferences --
      // it's possible this device has just been upgraded to Android 8+ and the channel
      // needs to be created in the system
      String channelId;
      if (notification.containsKey("channelId")) {
        channelId = notification.getString("channelId");
      } else {
        return;
      }

      ExponentNotificationManager manager = new ExponentNotificationManager(context);
      if (manager.getNotificationChannel(experienceId, channelId) == null) {
        JSONObject storedChannelDetails = manager.readChannelSettings(experienceId, channelId);
        if (storedChannelDetails != null) {
          createChannel(context, experienceId, channelId, storedChannelDetails);
        }
      }
    }
  }
}
