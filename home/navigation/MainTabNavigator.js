/* @flow */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import Colors from '../constants/Colors';
import Environment from '../utils/Environment';
import DiagnosticsStack from './DiagnosticsNavigator';
import ExploreStack from './ExploreNavigator';
import ProfileStack from './ProfileNavigator';
import ProjectsStack from './ProjectsNavigator';

const TabRoutes = Platform.select({
  ios: Environment.IsIOSRestrictedBuild
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
      },
  default: {
    ProjectsStack,
    ExploreStack,
    ProfileStack,
  },
});

const commonTabNavigatorProps = {
  navigationOptions: {
    header: null,
  },
};

const TabNavigator = Platform.select({
  ios: createBottomTabNavigator(TabRoutes, {
    ...commonTabNavigatorProps,
    initialRouteName: Environment.IsIOSRestrictedBuild ? 'ProfileStack' : 'ProjectsStack',
    tabBarOptions: {
      style: {
        backgroundColor: Colors.tabBar,
        borderTopColor: '#f2f2f2',
      },
    },
  }),
  android: createMaterialBottomTabNavigator(TabRoutes, {
    ...commonTabNavigatorProps,
    initialRouteName: 'ProjectsStack',
    activeTintColor: Colors.tabIconSelected,
    inactiveTintColor: Colors.tabIconDefault,
    barStyle: {
      backgroundColor: '#fff',
    },
  }),
  web: createBottomTabNavigator(TabRoutes, {
    ...commonTabNavigatorProps,
    initialRouteName: 'ProfileStack',
    // tabBarOptions: {
    //   style: {
    //     backgroundColor: Colors.tabBar,
    //     borderTopColor: '#f2f2f2',
    //     // Doesn't work
    //     flexDirection: 'row',
    //   },
    // },
  }),
});

export default TabNavigator;
