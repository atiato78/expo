import ExpoBattery from './ExpoBattery';
export async function getBatteryLevelAsync() {
    return await ExpoBattery.getBatteryLevelAsync();
}
export async function isBatteryChargingAsync() {
    return await ExpoBattery.isBatteryChargingAsync();
}
export async function getPowerStateAsync() {
    return await ExpoBattery.getPowerStateAsync();
}
//# sourceMappingURL=Battery.js.map