package host.exp.exponent.notifications.postoffice;

import android.os.Bundle;

import java.util.HashMap;
import java.util.Map;

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
    // send all pending deliveries !!!!
  }

  @Override
  public void unregisterModule(String experienceId) {
    mMailBoxes.remove(experienceId);
  }

  private void addUserInteractionToDatabase(String experienceId, Bundle userInteraction) {
    // ToDo
  }

  private void addForegroundNotificationToDatabase(String experienceId, Bundle notification) {
    // ToDo
  }

}
