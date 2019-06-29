import ExpoBattery from './ExpoBattery';

import { Platform, UnavailabilityError, EventEmitter } from '@unimodules/core';
import {
  PowerState,
  BatteryLevelUpdateCallback,
  BatteryListener,
  BatteryChargingUpdateCallback,
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
  return BatteryEventEmitter.addListener('Expo.BatteryLevelDidChange', callback);
}

export function watchBatteryChargingChange(callback: BatteryChargingUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.IsChargingDidChange', callback);
}

export function watchPowerStateChange(callback: PowerStateUpdateCallback): BatteryListener {
  return BatteryEventEmitter.addListener('Expo.PowerStateDidChange', callback);
}
