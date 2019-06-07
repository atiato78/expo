---
title: AppIcon
---

Change the native app icon at runtime.

| 🍎 iOS | 💚 Android | 💻 Web |
| ------ | ---------- | ------ |
| ✅     | ❌         | ❌     |

## Guide

You have to add the **non-transparen, 180x180, PNG** file to your app target: “CoolAppIcon.png”, “CoolAppIcon@2x.png”, “CoolAppIcon@3x.png” (name doesn't matter). The images cannot be in an asset catalog like the default icon.

You can get the following error if the app `info.plist` doesn't have a `CFBundleIcons~ipad` key with the identical object in it.

```
Error Domain=NSCocoaErrorDomain Code=4 "The file doesn’t exist."
UserInfo={NSUnderlyingError=0x60000005e0c0 {Error Domain=LSApplicationWorkspaceErrorDomain
Code=-105 "iconName not found in CFBundleAlternateIcons entry"
UserInfo={NSLocalizedDescription=iconName not found in CFBundleAlternateIcons entry}}}
```

// TODO: Bacon: guide for setting up the assets
// TODO: Bacon: Explain the info.plist keys https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-SW13

## Installation

This API is pre-installed in [managed](../../introduction/managed-vs-bare/#managed-workflow) apps. To use it in a [bare](../../introduction/managed-vs-bare/#bare-workflow) React Native app, follow its [installation instructions](https://github.com/expo/expo/tree/master/packages/expo-app-auth).

## Usage

```js
import * as AppIcon from 'expo-app-icon';
```

## Constants

### `isSupported`

```ts
export const isSupported: boolean;
```

The usage of alternate icons is supported (**iOS 10.3+**) and a list of alternatives have been defined.

#### Example

```ts
if (AppIcon.isSupported) {
  // Set custom icon.
}
```

### `icons`

// TODO: Bacon: Add default icon - non-standard iOS feature

```ts
export const alternateIcons: {
  [name: string]: AppIcon;
};
```

An object of alternatives where the key is the name of the icon.

#### Example

```ts
for (const icon of Object.values(AppIcon.icons)) {
  console.log(icon.name);
}
```

## Types

### `AppIcon`

```ts
export type AppIcon = {
  name: string;
  sources: string[];
  // TODO: Bacon: image source
  prerendered: boolean;
};
```

The native app icon object.

| Name        | Type                | Description                                                                                                      |
| ----------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| name        | `string | string[]` | Name of the icon, used for selecting and querying. iOS: `CFBundleIconFiles`                                      |
| sources     | `string[]`          | File name of the icon image. An array for multi-res images, this is required for iPad support (`png`, `@2x.png`) |
| prerendered | `boolean`           | **iOS** Icon already includes gloss effects.                                                                     |

## Methods

### `getIconAsync`

```js
AppIcon.getIconAsync(): Promise<AppIcon | null>
```

Get the current alternate app icon, if the default icon is in use then `null` will be returned.

| 🍎 iOS | 💚 Android | 💻 Web |
| ------ | ---------- | ------ |
| ✅     | ❌         | ❌     |

#### Return

| Name  | Type                      | Description                                                             |
| ----- | ------------------------- | ----------------------------------------------------------------------- |
| icons | `Promise<AppIcon | null>` | The current alternate app icon or `null` is the default icon is in use. |

#### Example

```js
const alternateIcon = await AppIcon.getIconAsync();

if (!alternateIcon) {
  console.log(alternateIcon.name);
}
```

### `setIconAsync`

```ts
AppIcon.setIconAsync(name: string | null): Promise<void>
```

Set the native app icon to an alternate icon you defined before publishing to the App Store, if the name is `null` then the default will be used. Running this command will show a prompt that says “You have changed the icon for …” this cannot be avoided or customized.

| 🍎 iOS | 💚 Android | 💻 Web |
| ------ | ---------- | ------ |
| ✅     | ❌         | ❌     |

#### Parameters

| Name | Type            | Description                                                                     |
| ---- | --------------- | ------------------------------------------------------------------------------- |
| name | `string | null` | Name of the predefined alternate icon, if `null` then the default will be used. |

#### Example

```js
try {
  await AppIcon.setIconAsync('goldlogo');
} catch (error) {
  // The icon either couldn't be set or isn't one of the predefined icons.
  // If you define new icons then you need to publish to the App Store again.
}
```
