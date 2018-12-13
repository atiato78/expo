import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import TabIcon from '../components/TabIcon';
import { Colors, Layout } from '../constants';
import ExpoApisStackNavigator from './ExpoApisStackNavigator';
import ExpoComponentsStackNavigator from './ExpoComponentsStackNavigator';
import ReactNativeCoreStackNavigator from './ReactNativeCoreStackNavigator';

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
  },
});

const createTabNavigator = Platform.select({
  default: createBottomTabNavigator,
  android: createMaterialBottomTabNavigator,
});

ExpoApisStackNavigator.path = '';
ExpoComponentsStackNavigator.path = '';
ReactNativeCoreStackNavigator.path = '';

const MainTabNavigator = createTabNavigator(
  {
    ExpoApis: {
      screen: ExpoApisStackNavigator,
      navigationOptions: {
        title: 'Expo API',
        linkName: 'Expo API',
      },
    },
    ExpoComponents: {
      screen: ExpoComponentsStackNavigator,
      navigationOptions: {
        title: 'Expo Components',
        linkName: 'Expo Components',
      },
    },
    ReactNativeCore: {
      screen: ReactNativeCoreStackNavigator,
      navigationOptions: {
        title: 'React Native Core',
        linkName: 'React Native Core',
      },
    },
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      let tabBarLabel;
      const { routeName } = navigation.state;
      if (routeName === 'ReactNativeCore') {
        tabBarLabel = Layout.isSmallDevice ? 'RN Core' : 'React Native Core';
      } else if (routeName === 'ExpoComponents') {
        tabBarLabel = Layout.isSmallDevice ? 'Components' : 'Expo Components';
      } else if (routeName === 'ExpoApis') {
        tabBarLabel = Layout.isSmallDevice ? 'APIs' : 'Expo APIs';
      }

      return {
        header: null,
        tabBarLabel,
        tabBarIcon: ({ focused }) => {
          const { routeName } = navigation.state;
          if (routeName === 'ReactNativeCore') {
            return <TabIcon name="group-work" focused={focused} />;
          } else if (routeName === 'ExpoComponents') {
            return <TabIcon name="filter" focused={focused} size={25} />;
          } else if (routeName === 'ExpoApis') {
            return <TabIcon name="functions" focused={focused} size={28} />;
          }
        },
      };
    },
    /* Below applies to material bottom tab navigator */
    activeTintColor: Colors.tabIconSelected,
    inactiveTintColor: Colors.tabIconDefault,
    shifting: true,
    barStyle: {
      backgroundColor: Colors.tabBar,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.tabIconDefault,
    },
    /* Below applies to bottom tab navigator */
    tabBarOptions: {
      style: styles.tabBar,
      labelStyle: styles.tabBarLabel,
      activeTintColor: Colors.tabIconSelected,
      inactiveTintColor: Colors.tabIconDefault,
    },
  }
);

MainTabNavigator.path = '';

MainTabNavigator.navigationOptions = {
  title: 'Home',
  linkName: 'home',
};

export default MainTabNavigator;
