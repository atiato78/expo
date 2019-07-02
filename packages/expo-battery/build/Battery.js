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
    return BatteryEventEmitter.addListener('Expo.batteryLevelDidChange', callback);
}
export function watchBatteryStateChange(callback) {
    return BatteryEventEmitter.addListener('Expo.batteryStateDidChange', callback);
}
export function watchPowerModeChange(callback) {
    return BatteryEventEmitter.addListener('Expo.powerModeDidChange', callback);
}
export function watchPowerStateChange(callback) {
    return BatteryEventEmitter.addListener('Expo.powerStateDidChange', callback);
}
//# sourceMappingURL=Battery.js.map