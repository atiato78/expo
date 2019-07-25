package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;

import host.exp.exponent.analytics.EXL;
import host.exp.exponent.notifications.ExponentNotificationManager;
import host.exp.exponent.notifications.NotificationConstants;
import host.exp.exponent.notifications.helpers.Utils;
import host.exp.expoview.R;

import static host.exp.exponent.notifications.NotificationHelper.createChannel;

public class ChannelModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    // TODO: finish this and separate channel logic from expoview
    if (!Utils.isAndroidVersionBelowOreo()) {
      if (notification.containsKey("channelId")) {
        String channelId = notification.getString("channelId");
        builder.setChannelId(ExponentNotificationManager.getScopedChannelId(experienceId, channelId));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          // if we don't yet have a channel matching this ID, check shared preferences --
          // it's possible this device has just been upgraded to Android 8+ and the channel
          // needs to be created in the system
          if (manager.getNotificationChannel(experienceId, channelId) == null) {
            JSONObject storedChannelDetails = manager.readChannelSettings(experienceId, channelId);
            if (storedChannelDetails != null) {
              createChannel(context, experienceId, channelId, storedChannelDetails);
            }
          }
        } else {
          // on Android 7.1 and below, read channel settings for sound, priority, and vibrate from shared preferences
          // and apply these settings to the notification individually, since channels do not exist
          JSONObject storedChannelDetails = manager.readChannelSettings(experienceId, channelId);
          if (storedChannelDetails != null) {
            if (storedChannelDetails.optBoolean(NotificationConstants.NOTIFICATION_CHANNEL_SOUND, false)) {
              builder.setDefaults(NotificationCompat.DEFAULT_SOUND);
            }

            String priorityString = storedChannelDetails.optString(NotificationConstants.NOTIFICATION_CHANNEL_PRIORITY);
            int priority;
            switch (priorityString) {
              case "max":
                priority = NotificationCompat.PRIORITY_MAX;
                break;
              case "high":
                priority = NotificationCompat.PRIORITY_HIGH;
                break;
              case "low":
                priority = NotificationCompat.PRIORITY_LOW;
                break;
              case "min":
                priority = NotificationCompat.PRIORITY_MIN;
                break;
              default:
                priority = NotificationCompat.PRIORITY_DEFAULT;
            }

            if (!notification.containsKey("priorityBelowOreo")) {
              notification.putInt("priorityBelowOreo", priority);
            }

            try {
              JSONArray vibrateJsonArray = storedChannelDetails.optJSONArray(NotificationConstants.NOTIFICATION_CHANNEL_VIBRATE);
              if (vibrateJsonArray != null) {
                long[] pattern = new long[vibrateJsonArray.length()];
                for (int i = 0; i < vibrateJsonArray.length(); i++) {
                  pattern[i] = ((Double) vibrateJsonArray.getDouble(i)).intValue();
                }
                builder.setVibrate(pattern);
              } else if (storedChannelDetails.optBoolean(NotificationConstants.NOTIFICATION_CHANNEL_VIBRATE, false)) {
                builder.setVibrate(new long[]{0, 500});
              }
            } catch (Exception e) {
            }
          } else {
          }
        }
      } else {
        // make a default channel so that people don't have to explicitly create a channel to see notifications
        createChannel(
            context,
            experienceId,
            NotificationConstants.NOTIFICATION_DEFAULT_CHANNEL_ID,
            context.getString(R.string.default_notification_channel_group),
            new HashMap());
      }
    }
  }
}
