/* @flow */
import React from 'react';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import Colors from '../constants/Colors';
import ExploreStack from './ExploreNavigator';
import ProfileStack from './ProfileNavigator';
import ProjectsStack from './ProjectsNavigator';

export default createMaterialBottomTabNavigator(
  {
    ProjectsStack,
    ExploreStack,
    ProfileStack,
  },
  {
    navigationOptions: {
      header: null,
    },
    initialRouteName: 'ProjectsStack',
    activeTintColor: Colors.tabIconSelected,
    inactiveTintColor: Colors.tabIconDefault,
    barStyle: {
      backgroundColor: '#fff',
    },
  }
);
