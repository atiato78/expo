---
title: Battery
---

Provide battery information for the physical device.

## Installation

This API is pre-installed in [managed](../../introduction/managed-vs-bare/#managed-workflow) apps. To use it in a [bare](../../introduction/managed-vs-bare/#bare-workflow) React Native app, follow its [installation instructions](https://github.com/expo/expo/tree/master/packages/expo-battery).

## API

```js
import * as Battery from 'expo-battery';
```

### Methods

- `Device.getBatteryStateAsync()`
- `Device.getBatteryLevelAsync()`
- `Device.getPowerStateAsync()`

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

### `Device.getPowerStateAsync()`

Gets the power state of the device including the battery level, whether it is plugged in, and if the system is currently operating in low power mode (power saver in Android). Displays a warning on iOS if battery monitoring not enabled, or if attempted on an emulator (where monitoring is not possible)

#### Returns

Returns a promise with an object with the following fields:

- **batteryLevel (_float_)** -- a float between 0 and 1.

- **batteryState (_string_)** -- `unplugged` if unplugged, `charging` if charging, `full` if battery level is full, `unknown` if battery in an unknown state.

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

### `Device.getBatteryStateAsync()`

Tells the battery's current state.

- `unplugged` if battery is not charging
- `charging` if battery is charging
- `full` if battery level is full
- `unkown` if the battery state is unknown or unable to access

#### Returns

Returns a promise that resolves the `string` value for whether the device is any of the four state above.

**Examples**

```js
Device.isBatteryChargingAsync().then(isCharging => {
  // 'charging'
});
```
