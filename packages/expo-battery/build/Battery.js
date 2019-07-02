import ExpoBattery from './ExpoBattery';
import { EventEmitter } from '@unimodules/core';
const BatteryEventEmitter = new EventEmitter(ExpoBattery);
export async function getBatteryLevelAsync() {
    return await ExpoBattery.getBatteryLevelAsync();
}
export async function isBatteryChargingAsync() {
    return await ExpoBattery.isBatteryChargingAsync();
}
export async function getPowerStateAsync() {
    return await ExpoBattery.getPowerStateAsync();
}
export function watchBatteryLevelChange(callback) {
    return BatteryEventEmitter.addListener('Expo.BatteryLevelDidChange', callback);
}
export function watchBatteryChargingChange(callback) {
    return BatteryEventEmitter.addListener('Expo.IsChargingDidChange', callback);
}
export function watchLowPowerModeChange(callback) {
    return BatteryEventEmitter.addListener('Expo.LowPowerModeDidChange', callback);
}
//# sourceMappingURL=Battery.js.map