import { NativeModulesProxy } from '@unimodules/core';

const { ExpoBattery } = NativeModulesProxy;

export { default as ExpoBatteryView } from './ExpoBatteryView';

export async function someGreatMethodAsync(options: any) {
  return await ExpoBattery.someGreatMethodAsync(options);
}
