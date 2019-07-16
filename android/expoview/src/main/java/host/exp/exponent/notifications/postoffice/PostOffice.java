package host.exp.exponent.notifications.postoffice;

import android.os.Bundle;

import com.raizlabs.android.dbflow.sql.builder.Condition;
import com.raizlabs.android.dbflow.sql.language.Select;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import host.exp.exponent.notifications.postoffice.pendingdeliveries.BundleHelper;
import host.exp.exponent.notifications.postoffice.pendingdeliveries.PendingForegroundNotification;
import host.exp.exponent.notifications.postoffice.pendingdeliveries.PendingForegroundNotification$Table;
import host.exp.exponent.notifications.postoffice.pendingdeliveries.PendingUserInteraction;
import host.exp.exponent.notifications.postoffice.pendingdeliveries.PendingUserInteraction$Table;

class PostOffice implements PostOfficeInterface {

  private Map<String, MailboxInterface> mMailBoxes = new HashMap<>();

  @Override
  public void notifyAboutUserInteraction(String experienceId, Bundle userInteraction) {
    if (mMailBoxes.containsKey(experienceId)) {
      mMailBoxes.get(experienceId).onUserInteraction(userInteraction);
    } else {
      addUserInteractionToDatabase(experienceId, userInteraction);
    }
  }

  @Override
  public void sendForegroundNotification(String experienceId, Bundle notification) {
    if (mMailBoxes.containsKey(experienceId)) {
      mMailBoxes.get(experienceId).onForegroundNotification(notification);
    } else {
      addForegroundNotificationToDatabase(experienceId, notification);
    }
  }

  @Override
  public void registerModuleAndGetPendingDeliveries(String experienceId, MailboxInterface mailbox) {
    mMailBoxes.put(experienceId, mailbox);

    List<PendingForegroundNotification> pendingForegroundNotificationList = new Select().from(PendingForegroundNotification.class)
        .where(Condition.column(PendingForegroundNotification$Table.EXPERIENCEID).is(experienceId))
        .queryList();

    List<PendingUserInteraction> pendingUserInteractionList = new Select().from(PendingUserInteraction.class)
        .where(Condition.column(PendingUserInteraction$Table.EXPERIENCEID).is(experienceId))
        .queryList();

    for (PendingForegroundNotification pendingForegroundNotification : pendingForegroundNotificationList) {
      mailbox.onForegroundNotification(
          BundleHelper.jsonStringToBundle(pendingForegroundNotification.getNotification())
      );
      pendingForegroundNotification.delete();
    }

    for (PendingUserInteraction pendingUserInteraction : pendingUserInteractionList) {
      mailbox.onForegroundNotification(
          BundleHelper.jsonStringToBundle(pendingUserInteraction.getUserInteraction())
      );
      pendingUserInteraction.delete();
    }
  }

  @Override
  public void unregisterModule(String experienceId) {
    mMailBoxes.remove(experienceId);
  }

  private void addUserInteractionToDatabase(String experienceId, Bundle userInteraction) {
    PendingUserInteraction pendingUserInteraction = new PendingUserInteraction();
    pendingUserInteraction.setExperienceId(experienceId);
    pendingUserInteraction.setUserInteraction(userInteraction.toString());
    pendingUserInteraction.save();
  }

  private void addForegroundNotificationToDatabase(String experienceId, Bundle notification) {
    PendingForegroundNotification pendingForegroundNotification = new PendingForegroundNotification();
    pendingForegroundNotification.setExperienceId(experienceId);
    pendingForegroundNotification.setNotification(notification.toString());
  }

}
