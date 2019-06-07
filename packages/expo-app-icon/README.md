# expo-app-icon

TODO: Bacon: ...

# API documentation

- [Documentation for the master branch](https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/sdk/app-icon.md)
- [Documentation for the latest stable release](https://docs.expo.io/versions/latest/sdk/app-icon/)

# Installation

This package is pre-installed in [managed](https://docs.expo.io/versions/latest/introduction/managed-vs-bare/) Expo projects. You may skip the rest of the installation guide if this applies to you.

For bare React Native projects, you must ensure that you have [installed and configured the `react-native-unimodules` package](https://github.com/unimodules/react-native-unimodules) before continuing.

### Add the package to your npm dependencies

```
npm install expo-app-icon
```

### Configure for iOS

Run `pod install` in the ios directory after installing the npm package.

### Configure for Android

No additional set up necessary.

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).

TODO: Bacon: How to define custom icons before deploying to the app store

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleAlternateIcons</key>
	<dict>
		<key>neaticon</key>
		<dict>
			<key>CFBundleIconFiles</key>
			<array>
				<string>neaticon</string>
			</array>
			<key>UIPrerenderedIcon</key>
			<string>NO</string>
		</dict>
	</dict>
	<key>CFBundlePrimaryIcon</key>
	<dict>
		<key>CFBundleIconFiles</key>
		<array>
			<string></string>
		</array>
		<key>UIPrerenderedIcon</key>
		<false/>
	</dict>
	<key>UINewsstandIcon</key>
	<dict>
		<key>CFBundleIconFiles</key>
		<array>
			<string></string>
		</array>
		<key>UINewsstandBindingType</key>
		<string>UINewsstandBindingTypeMagazine</string>
		<key>UINewsstandBindingEdge</key>
		<string>UINewsstandBindingEdgeLeft</string>
	</dict>
</dict>
</plist>
```
