package expo.modules.battery;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.RegistryLifecycleListener;
import org.unimodules.core.interfaces.services.EventEmitter;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import android.os.Bundle;
import android.os.PowerManager;

public class BatteryModule extends ExportedModule implements RegistryLifecycleListener {
  private static final String NAME = "ExpoBattery";
  private static final String TAG = BatteryModule.class.getSimpleName();
  private static final String BATTERY_LEVEL_EVENT_NAME = "Expo.BatteryLevelDidChange";
  private static final String BATTERY_CHARGED_EVENT_NAME = "Expo.IsChargingDidChange";
  private static final String POWERMODE_EVENT_NAME = "Expo.LowPowerModeDidChange";

  private ModuleRegistry mModuleRegistry;
  static protected Context mContext;
  static private EventEmitter mEventEmitter;

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
    mEventEmitter = moduleRegistry.getModule(EventEmitter.class);
    mContext.registerReceiver(new BatteryChargingReceiver(), new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    mContext.registerReceiver(new PowerSaverReceiver(), new IntentFilter("android.os.action.POWER_SAVE_MODE_CHANGED"));
    IntentFilter ifilter = new IntentFilter();
    ifilter.addAction(Intent.ACTION_BATTERY_LOW);
    ifilter.addAction(Intent.ACTION_BATTERY_OKAY);
    mContext.registerReceiver(new BatteryLevelReceiver(), ifilter);
  }

  static protected void onIsChargingChange(boolean isCharging){
    Bundle result = new Bundle();
    result.putBoolean("isCharging", isCharging);
    mEventEmitter.emit(BATTERY_CHARGED_EVENT_NAME,result);
  }

  static protected void onLowPowerModeChange(boolean lowPowerMode){
    Bundle result = new Bundle();
    result.putBoolean("lowPowerMode", lowPowerMode);
    mEventEmitter.emit(POWERMODE_EVENT_NAME,result);
  }

  static protected void onBatteryLevelChange(float BatteryLevel){
    Bundle result = new Bundle();
    result.putFloat("BatteryLevel", BatteryLevel);
    mEventEmitter.emit(BATTERY_LEVEL_EVENT_NAME,result);
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
