export type PowerState = {
  batteryLevel?: number;
  isCharging?: boolean;
  lowPowerMode?: boolean;
};

export type batteryLevel = { batteryLevel: number };
export type BatteryLevelUpdateCallback = (level: batteryLevel) => void;
// export type isCharging = { isCharging: boolean };
export type BatteryStateUpdateCallback = (batteryState: string) => void;
export type isLowPowerMode = { isLowPowerMode: boolean };
export type PowerModeUpdateCallback = (isLowPowerMode: boolean) => void;
export type PowerStateUpdateCallback = (PowerState: PowerState) => void;
export type BatteryListener = { remove: () => void };
