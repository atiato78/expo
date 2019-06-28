import ExpoBattery from './ExpoBattery';

import { Platform, UnavailabilityError } from '@unimodules/core';
import { PowerState } from './Battery.types';

export async function getBatteryLevelAsync(): Promise<number> {
  return await ExpoBattery.getBatteryLevelAsync();
}

export async function isBatteryChargingAsync(): Promise<boolean> {
  return await ExpoBattery.isBatteryChargingAsync();
}

export async function getPowerStateAsync(): Promise<PowerState> {
  return await ExpoBattery.getPowerStateAsync();
}
