package expo.modules.battery;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.BatteryManager;

public class BatteryChargingReceiver extends BroadcastReceiver {
  public static String INTENT_ACTION = "expo.modules.battery.BatteryChargingReceiver";
  public BatteryChargingReceiver(){}

  @Override
  public void onReceive(Context context, Intent intent) {
    int status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
    boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
        status == BatteryManager.BATTERY_STATUS_FULL;
    BatteryModule.onIsChargingChange(isCharging);
  }
}
