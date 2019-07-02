import { PowerState, BatteryLevelUpdateCallback, BatteryListener, BatteryChargingUpdateCallback, LowPowerModeUpdateCallback } from './Battery.types';
export declare function getBatteryLevelAsync(): Promise<number>;
export declare function isBatteryChargingAsync(): Promise<boolean>;
export declare function getPowerStateAsync(): Promise<PowerState>;
export declare function watchBatteryLevelChange(callback: BatteryLevelUpdateCallback): BatteryListener;
export declare function watchBatteryChargingChange(callback: BatteryChargingUpdateCallback): BatteryListener;
export declare function watchLowPowerModeChange(callback: LowPowerModeUpdateCallback): BatteryListener;
