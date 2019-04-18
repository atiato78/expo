/* @flow */
import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';

import Colors from '../constants/Colors';
import Environment from '../utils/Environment';
import DiagnosticsStack from './DiagnosticsNavigator';
import ExploreStack from './ExploreNavigator';
import ProfileStack from './ProfileNavigator';
import ProjectsStack from './ProjectsNavigator';

const TabRoutes = Environment.IsIOSRestrictedBuild
  ? {
      ProjectsStack,
      DiagnosticsStack,
      ProfileStack,
    }
  : {
      ProjectsStack,
      ExploreStack,
      DiagnosticsStack,
      ProfileStack,
    };

const initialRouteName = Environment.IsIOSRestrictedBuild ? 'ProfileStack' : 'ProjectsStack';

export default createBottomTabNavigator(TabRoutes, {
  navigationOptions: {
    header: null,
  },
  initialRouteName,
  tabBarOptions: {
    style: {
      backgroundColor: Colors.tabBar,
      borderTopColor: '#f2f2f2',
    },
  },
});
