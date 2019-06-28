---
title: Battery
---

Provide battery information for the physical device.

## Installation

This API is pre-installed in [managed](../../introduction/managed-vs-bare/#managed-workflow) apps. It is not yet available for [bare](../../introduction/managed-vs-bare/#bare-workflow) React Native apps.

## API

```js
import { Battery } from 'expo';
```

### Constants

### Methods

- `Device.isBatteryChargingAsync()`
- `Device.getBatteryLevelAsync()`
- `Device.getPowerStateAsync()` (iOS only)

## Methods

### `Device.getBatteryLevelAsync()`

Get the battery level of the device as a float between 0 and 1.

#### Returns

A Promise that resolves to a float representing the battery level.

**Examples**

```js
Device.getBatteryLevelAsync().then(batteryLevel => {
  // 0.759999
});
```

### `Device.getPowerStateAsync()` (IOS only)

Gets the power state of the device including the battery level, whether it is plugged in, and if the system is currently operating in low power mode. Displays a warning on iOS if battery monitoring not enabled, or if attempted on an emulator (where monitoring is not possible)

#### Returns

Returns a promise with an object with the following fields:

- **batteryLevel (_float_)** -- a float between 0 and 1.

- **batteryState (_string_)** -- `unplugged` if unplugged, `plugged` if plugged.

- **lowPowerMode (_string_)** -- `true` if lowPowerMode is on, `false` if lowPowerMode is off.

**Examples**

```js
Device.getPowerStateAsync().then(state => {
  // {
  //   batteryLevel: 0.759999,
  //   batteryState: 'unplugged',
  //   lowPowerMode: false,
  // }
});
```

### `Device.isBatteryChargingAsync()`

Tells if the battery is currently charging.

#### Returns

Returns a `Promise<boolean>` that resolves the `boolean` value for whether the device is charging or not.

**Examples**

```js
Device.isBatteryChargingAsync().then(isCharging => {
  // true or false
});
```
