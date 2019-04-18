/* @flow */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { createStackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';
import BackgroundLocationScreen from '../screens/BackgroundLocationScreen';
import DiagnosticsScreen from '../screens/DiagnosticsScreen';
import GeofencingScreen from '../screens/GeofencingScreen';
import defaultNavigationOptions from './defaultNavigationOptions';
import renderIcon from './renderIcon';

export default createStackNavigator(
  {
    Diagnostics: DiagnosticsScreen,
    BackgroundLocation: BackgroundLocationScreen,
    Geofencing: GeofencingScreen,
  },
  {
    initialRouteName: 'Diagnostics',
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ focused }) => renderIcon(Ionicons, 'ios-git-branch', 26, focused),
      tabBarLabel: 'Diagnostics',
    },
    cardStyle: {
      backgroundColor: Colors.greyBackground,
    },
  }
);
