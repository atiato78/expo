package host.exp.exponent.notifications.helpers;

import android.os.Build;

public class Utiles {

  public static boolean isAndroidVersionBelowOreo() {
    return !(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O);
  }

}
