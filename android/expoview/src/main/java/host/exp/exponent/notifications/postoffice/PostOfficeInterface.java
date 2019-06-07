package host.exp.exponent.notifications.postoffice;

import android.os.Bundle;

public interface PostOfficeInterface {

  void notifyAboutUserInteraction(String experienceId, Bundle userInteraction);

  void sendForegroundNotification(String experienceId, Bundle notification);

  void registerModuleAndGetPendingDeliveries(String experienceId, MailboxInterface mailbox);

  void unregisterModule(String experienceId);

}
