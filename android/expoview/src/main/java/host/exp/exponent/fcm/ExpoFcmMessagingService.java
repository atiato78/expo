package host.exp.exponent.fcm;

import android.os.Bundle;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import host.exp.exponent.Constants;
import host.exp.exponent.notifications.presenters.NotificationPresenterProvider;

import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_BODY;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_CATEGORY;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_CHANNEL_ID;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_COLOR;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_DATA;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_EXPERIENCE_ID_KEY;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_ICON;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_PRIORITY;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_REMOTE;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_SOUND;
import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_TITLE;

public class ExpoFcmMessagingService extends FirebaseMessagingService {

  @Override
  public void onNewToken(String token) {
    if (!Constants.FCM_ENABLED) {
      return;
    }

    FcmRegistrationIntentService.registerForeground(getApplicationContext(), token);
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    if (!Constants.FCM_ENABLED) {
      return;
    }

    Bundle bundle = new Bundle();

    String experienceId = remoteMessage.getData().get(NOTIFICATION_EXPERIENCE_ID_KEY);
    bundle.putString(NOTIFICATION_EXPERIENCE_ID_KEY, experienceId);
    bundle.putString(NOTIFICATION_CHANNEL_ID, remoteMessage.getData().get(NOTIFICATION_CHANNEL_ID));
    bundle.putString(NOTIFICATION_BODY, remoteMessage.getData().get(NOTIFICATION_BODY));
    bundle.putString(NOTIFICATION_TITLE, remoteMessage.getData().get(NOTIFICATION_TITLE));
    bundle.putString(NOTIFICATION_CATEGORY, remoteMessage.getData().get(NOTIFICATION_CATEGORY));
    bundle.putString(NOTIFICATION_ICON, remoteMessage.getData().get(NOTIFICATION_ICON));
    bundle.putString(NOTIFICATION_PRIORITY, remoteMessage.getData().get(NOTIFICATION_PRIORITY));
    bundle.putString(NOTIFICATION_COLOR, remoteMessage.getData().get(NOTIFICATION_COLOR));
    bundle.putString(NOTIFICATION_DATA, remoteMessage.getData().get(NOTIFICATION_DATA));
    bundle.putString(NOTIFICATION_SOUND, remoteMessage.getData().get(NOTIFICATION_SOUND));
    bundle.putBoolean(NOTIFICATION_REMOTE, true);

    NotificationPresenterProvider.getNotificationPresenter().presentNotification(
      this.getApplicationContext(),
      experienceId,
      bundle
    );
  }
}
