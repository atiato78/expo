package expo.modules.battery;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.BatteryManager;
import android.os.PowerManager;

public class PowerSaverBroadcastReceiver extends BroadcastReceiver {
  public static String INTENT_ACTION = "expo.modules.battery.PowerSaverBroadcastReceiver";

  public PowerSaverBroadcastReceiver() {
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    int level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
    int scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
    float batteryLevel = level / (float) scale;

    int status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
    boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
        status == BatteryManager.BATTERY_STATUS_FULL;

    PowerManager powerManager = (PowerManager) BatteryModule.mContext.getApplicationContext().getSystemService(Context.POWER_SERVICE);
    boolean lowPowerMode = powerManager.isPowerSaveMode();

    BatteryModule.onPowerStateChange(batteryLevel, isCharging, lowPowerMode);
  }
}
