export type PowerState = {
  batteryLevel?: number;
  isCharging?: boolean;
  lowPowerMode?: boolean;
};

export type batteryLevel = { batteryLevel: number };
export type BatteryLevelUpdateCallback = (level: batteryLevel) => void;
export type isCharging = { isCharging: boolean };
export type BatteryChargingUpdateCallback = (isCharging: isCharging) => void;
export type isLowPowerMode = { isLowPowerMode: boolean };
export type LowPowerModeUpdateCallback = (isLowPowerMode: isCharging) => void;
export type PowerStateUpdateCallback = (PowerState: PowerState) => void;
export type BatteryListener = { remove: () => void };
