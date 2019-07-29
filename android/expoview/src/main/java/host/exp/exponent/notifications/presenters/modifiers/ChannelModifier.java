package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import host.exp.exponent.analytics.EXL;
import host.exp.exponent.notifications.ExponentNotificationManager;
import host.exp.exponent.notifications.NotificationConstants;
import host.exp.exponent.notifications.helpers.Utils;
import host.exp.expoview.R;

import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_CHANNEL_ID;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_PRIORITY;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_SOUND;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_VIBRATE;
import static host.exp.exponent.notifications.NotificationHelper.createChannel;

public class ChannelModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    ExponentNotificationManager manager = new ExponentNotificationManager(context);
    if (!notification.containsKey(NOTIFICATION_CHANNEL_ID)) {
      // make a default channel so that people don't have to explicitly create a channel to see notifications
      createChannel(
          context,
          experienceId,
          NotificationConstants.NOTIFICATION_DEFAULT_CHANNEL_ID,
          context.getString(R.string.default_notification_channel_group),
          new HashMap()
      );
      notification.putString(NOTIFICATION_CHANNEL_ID, NotificationConstants.NOTIFICATION_DEFAULT_CHANNEL_ID);
    }

    String channelId = notification.getString(NOTIFICATION_CHANNEL_ID);
    builder.setChannelId(ExponentNotificationManager.getScopedChannelId(experienceId, channelId));

    if (!Utils.isAndroidVersionBelowOreo()) {
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

        if (!notification.containsKey(NOTIFICATION_SOUND)) {
          notification.putBoolean(
              NOTIFICATION_SOUND,
              storedChannelDetails.optBoolean(NotificationConstants.NOTIFICATION_CHANNEL_SOUND, false)
          );
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

        if (!notification.containsKey(NOTIFICATION_PRIORITY)) {
          notification.putInt(NOTIFICATION_PRIORITY, priority);
        }

        if (!notification.containsKey(NOTIFICATION_VIBRATE)) {
          try {
            JSONArray vibrateJsonArray = storedChannelDetails.optJSONArray(NotificationConstants.NOTIFICATION_CHANNEL_VIBRATE);
            if (vibrateJsonArray != null) {
              long []pattern = new long[vibrateJsonArray.length()];
              for (int i = 0; i < vibrateJsonArray.length(); i++) {
                pattern[i] = ((Double) vibrateJsonArray.getDouble(i)).intValue();
              }
              notification.putLongArray(NOTIFICATION_VIBRATE, pattern);
            } else if (storedChannelDetails.optBoolean(NotificationConstants.NOTIFICATION_CHANNEL_VIBRATE, false)) {
              notification.putLongArray(NOTIFICATION_VIBRATE, new long[]{0, 500});
            }
          } catch (Exception e) {
          }
        }
      }
    }
  }
}
