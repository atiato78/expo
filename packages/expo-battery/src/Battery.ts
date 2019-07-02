import ExpoBattery from './ExpoBattery';

import { Platform, UnavailabilityError, EventEmitter } from '@unimodules/core';
import {
  PowerState,
  BatteryLevelUpdateCallback,
  BatteryListener,
  BatteryChargingUpdateCallback,
  LowPowerModeUpdateCallback
} from './Battery.types';

const BatteryEventEmitter = new EventEmitter(ExpoBattery);

export async function getBatteryLevelAsync(): Promise<number> {
  return await ExpoBattery.getBatteryLevelAsync();
}

export async function isBatteryChargingAsync(): Promise<boolean> {
  return await ExpoBattery.isBatteryChargingAsync();
}

export async function getPowerStateAsync(): Promise<PowerState> {
  return await ExpoBattery.getPowerStateAsync();
}

export function watchBatteryLevelChange(callback: BatteryLevelUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.batteryLevelDidChange', callback);
}

export function watchBatteryChargingChange(callback: BatteryChargingUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.isChargingDidChange', callback);
}

export function watchLowPowerModeChange(callback: LowPowerModeUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.LowPowerModeDidChange', callback);
  
export function watchPowerStateChange(callback: PowerStateUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.powerStateDidChange', callback);
}
