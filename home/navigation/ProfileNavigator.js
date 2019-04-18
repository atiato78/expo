/* @flow */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { createStackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';
import ProfileScreen from '../screens/ProfileScreen';
import ProjectsForUserScreen from '../screens/ProjectsForUserScreen';
import SnacksForUserScreen from '../screens/SnacksForUserScreen';
import UserSettingsScreen from '../screens/UserSettingsScreen';
import defaultNavigationOptions from './defaultNavigationOptions';
import renderIcon from './renderIcon';

export default createStackNavigator(
  {
    Profile: ProfileScreen,
    UserSettings: UserSettingsScreen,
    ProjectsForUser: ProjectsForUserScreen,
    SnacksForUser: SnacksForUserScreen,
  },
  {
    initialRouteName: 'Profile',
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ focused }) => renderIcon(Ionicons, 'ios-person', 26, focused),
      tabBarLabel: 'Profile',
    },
    cardStyle: {
      backgroundColor: Colors.greyBackground,
    },
  }
);
