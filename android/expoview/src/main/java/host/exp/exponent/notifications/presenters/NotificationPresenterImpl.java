package host.exp.exponent.notifications.presenters;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;

import java.util.ArrayList;
import java.util.List;

import host.exp.exponent.notifications.presenters.modifiers.BodyModifier;
import host.exp.exponent.notifications.presenters.modifiers.CategoryModifier;
import host.exp.exponent.notifications.presenters.modifiers.ChannelModifier;
import host.exp.exponent.notifications.presenters.modifiers.ColorModifier;
import host.exp.exponent.notifications.presenters.modifiers.ExperienceIdModifier;
import host.exp.exponent.notifications.presenters.modifiers.IconModifier;
import host.exp.exponent.notifications.presenters.modifiers.ImportanceModifier;
import host.exp.exponent.notifications.presenters.modifiers.IntentModifier;
import host.exp.exponent.notifications.presenters.modifiers.LinkModifier;
import host.exp.exponent.notifications.presenters.modifiers.NotificationModifier;
import host.exp.exponent.notifications.presenters.modifiers.SoundModifer;
import host.exp.exponent.notifications.presenters.modifiers.TitleModifier;
import io.fabric.sdk.android.services.concurrency.AsyncTask;

public class NotificationPresenterImpl implements NotificationPresenter {

  private volatile static List<NotificationModifier> mModifiers = null;

  @Override
  public void presentNotification(Context context, String experienceId, Bundle notification,final int notificationId) {

    AsyncTask.execute(()-> {
      NotificationCompat.Builder builder = new NotificationCompat.Builder(context);

      notification.putInt("notificationIntId", notificationId);

      for (NotificationModifier notificationModifier : NotificationPresenterImpl.getNotificationModifiers()) {
        notificationModifier.modify(builder, notification, context, experienceId);
      }

      NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(context);
      notificationManagerCompat.notify(notificationId, builder.build());
    });

  }

  public static synchronized List<NotificationModifier> getNotificationModifiers() {
    if (mModifiers != null) {
      return mModifiers;
    }
    mModifiers = new ArrayList<>();

    mModifiers.add(new ExperienceIdModifier());
    mModifiers.add(new TitleModifier());
    mModifiers.add(new BodyModifier());
    mModifiers.add(new SoundModifer());
    mModifiers.add(new ChannelModifier());
    mModifiers.add(new IconModifier());
    mModifiers.add(new ImportanceModifier());
    mModifiers.add(new ColorModifier());
    mModifiers.add(new IntentModifier());
    mModifiers.add(new LinkModifier());
    mModifiers.add(new CategoryModifier());

    return mModifiers;
  }

}
