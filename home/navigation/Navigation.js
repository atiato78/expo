/* @flow */
import { createBrowserApp } from '@react-navigation/web';
import React from 'react';
import { Platform } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation';

import QRCodeScreen from '../screens/QRCodeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import defaultNavigationOptions from './defaultNavigationOptions';
import MainTabNavigator from './MainTabNavigator';

const RootStack = createStackNavigator(
  {
    Tabs: MainTabNavigator,
    SignIn: SignInScreen,
    SignUp: SignUpScreen,
    QRCode: QRCodeScreen,
  },
  {
    initialRouteName: 'Tabs',
    mode: 'modal',
    defaultNavigationOptions,
  }
);

const createApp = Platform.select({ web: createBrowserApp, default: createAppContainer });

export default createApp(RootStack);
