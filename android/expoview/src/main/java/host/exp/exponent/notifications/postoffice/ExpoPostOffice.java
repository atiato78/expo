package host.exp.exponent.notifications.postoffice;

import android.os.Bundle;

public interface ExpoPostOffice {

  void notifyAboutUserInteraction(String experienceId, Bundle userInteraction);

  void sendForegroundNotification(String experienceId, Bundle notification);

  void registerModuleAndGetPendingDeliveries(String experienceId, Mailbox mailbox);

  void unregisterModule(String experienceId);

}
