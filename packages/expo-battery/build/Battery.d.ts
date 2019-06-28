import { PowerState } from './Battery.types';
export declare function getBatteryLevelAsync(): Promise<number>;
export declare function isBatteryChargingAsync(): Promise<boolean>;
export declare function getPowerStateAsync(): Promise<PowerState>;
