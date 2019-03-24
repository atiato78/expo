import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';

import MainUITabNavigator from './MainUITabNavigator';
import MediaCreationNavigator from './MediaCreationNavigator';

export default createBottomTabNavigator(
  {
    MediaCreation: MediaCreationNavigator,
    UI: MainUITabNavigator,
  },
  {
    // initialRouteName: 'Media',
    tabBarOptions: {
      showLabel: false,
    },
  }
);
