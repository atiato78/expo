package host.exp.exponent.notifications.postoffice;

import android.os.Bundle;

public interface Mailbox {

  void onUserInteraction(Bundle userInteraction);

  void onForegroundNotification(Bundle notification);

}
