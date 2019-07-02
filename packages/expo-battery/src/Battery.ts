import ExpoBattery from './ExpoBattery';

import { Platform, UnavailabilityError, EventEmitter } from '@unimodules/core';
import {
  PowerState,
  BatteryLevelUpdateCallback,
  BatteryListener,
  BatteryStateUpdateCallback,
  PowerModeUpdateCallback, 
  PowerStateUpdateCallback
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

export function watchBatteryStateChange(callback: BatteryStateUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.batteryStateDidChange', callback);
}

export function watchPowerModeChange(callback: PowerModeUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.powerModeDidChange', callback);
}

export function watchPowerStateChange(callback: PowerStateUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.powerStateDidChange', callback);
}
