export declare type PowerState = {
    batteryLevel?: number;
    isCharging?: boolean;
    lowPowerMode?: boolean;
};
export declare type batteryLevel = {
    batteryLevel: number;
};
export declare type BatteryLevelUpdateCallback = (level: batteryLevel) => void;
export declare type isCharging = {
    isCharging: boolean;
};
export declare type BatteryChargingUpdateCallback = (isCharging: isCharging) => void;
export declare type isLowPowerMode = {
    isLowPowerMode: boolean;
};
export declare type LowPowerModeUpdateCallback = (isLowPowerMode: isCharging) => void;
export declare type PowerStateUpdateCallback = (PowerState: PowerState) => void;
export declare type BatteryListener = {
    remove: () => void;
};
