package host.exp.exponent.fcm;

import android.os.Bundle;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import host.exp.exponent.Constants;
import host.exp.exponent.notifications.presenters.NotificationPresenterProvider;

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

    String experienceId = (String) remoteMessage.getData().get("experienceId");
    bundle.putString("experienceId", experienceId);

    bundle.putString("channelId", remoteMessage.getData().get("channelId"));
    bundle.putString("body", remoteMessage.getData().get("body"));
    bundle.putString("title", remoteMessage.getData().get("title"));
    bundle.putString("categoryId", remoteMessage.getData().get("categoryId"));
    bundle.putString("icon", remoteMessage.getData().get("icon"));
    bundle.putString("priorityBelowOreo", remoteMessage.getData().get("priorityBelowOreo"));
    bundle.putString("color", remoteMessage.getData().get("color"));
    bundle.putString("data", remoteMessage.getData().get("data"));
    bundle.putBoolean("remote", true);

    NotificationPresenterProvider.getNotificationPresenter().presentNotification(
        this.getApplicationContext(),
        experienceId,
        bundle
    );
  }
}
