package expo.modules.battery;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.RegistryLifecycleListener;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import android.os.Bundle;
import android.os.PowerManager;

public class BatteryModule extends ExportedModule implements RegistryLifecycleListener {
  private static final String NAME = "ExpoBattery";
  private static final String TAG = BatteryModule.class.getSimpleName();

  private ModuleRegistry mModuleRegistry;
  private Context mContext;

  public BatteryModule(Context context) {
    super(context);
    mContext = context;
  }

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
  }

  @ExpoMethod
  public void getBatteryLevelAsync(Promise promise) {
    Intent batteryIntent = this.mContext.getApplicationContext().registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    int level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
    int scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
    float batteryLevel = level / (float) scale;
    promise.resolve(batteryLevel);
  }

  @ExpoMethod
  public void isBatteryChargingAsync(Promise promise) {
    IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
    Intent batteryStatus = this.mContext.getApplicationContext().registerReceiver(null, ifilter);
    int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
    boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING;
    promise.resolve(isCharging);
  }

  @ExpoMethod
  public void getPowerStateAsync(Promise promise) {
    Bundle result = new Bundle();
    IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);

    Intent batteryIntent = this.mContext.getApplicationContext().registerReceiver(null, ifilter);
    int level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
    int scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
    float batteryLevel = level / (float) scale;
    result.putFloat("batteryLevel", batteryLevel);

    Intent batteryStatus = this.mContext.getApplicationContext().registerReceiver(null, ifilter);
    int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
    boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING;
    result.putBoolean("isCharging", isCharging);

    PowerManager powerManager = (PowerManager)mContext.getApplicationContext().getSystemService(Context.POWER_SERVICE);
    boolean lowPowerMode = powerManager.isPowerSaveMode();
    result.putBoolean("lowPowerMode", lowPowerMode);

    promise.resolve(result);
  }
}
