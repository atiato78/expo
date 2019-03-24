import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import MainUITabNavigator from './MainUITabNavigator';
import MediaCreationNavigator from './MediaCreationNavigator';

export default createBottomTabNavigator(
  {
    MediaCreation: MediaCreationNavigator,
    SocialUI: MainUITabNavigator,
  },
  {
    initialRouteName: 'SocialUI',
    tabBarComponent: () => <View />,
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      showLabel: false,
    },
  }
);
