/* @flow */
import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { createStackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';
import ProfileScreen from '../screens/ProfileScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import defaultNavigationOptions from './defaultNavigationOptions';
import renderIcon from './renderIcon';

export default createStackNavigator(
  {
    Projects: ProjectsScreen,
    Profile: ProfileScreen,
  },
  {
    initialRouteName: 'Projects',
    navigationOptions: {
      tabBarIcon: ({ focused }) => renderIcon(Entypo, 'grid', 24, focused),
      tabBarLabel: 'Projects',
    },
    defaultNavigationOptions,
    cardStyle: {
      backgroundColor: Colors.greyBackground,
    },
  }
);
