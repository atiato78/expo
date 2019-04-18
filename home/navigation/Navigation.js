/* @flow */
import { Entypo, Ionicons } from '@expo/vector-icons';
import { createBrowserApp } from '@react-navigation/web';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
} from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import Colors from '../constants/Colors';
import BackgroundLocationScreen from '../screens/BackgroundLocationScreen';
import DiagnosticsScreen from '../screens/DiagnosticsScreen';
import ExploreScreen from '../screens/ExploreScreen';
import GeofencingScreen from '../screens/GeofencingScreen';
import ProjectsForUserScreen from '../screens/ProjectsForUserScreen';
import SnacksForUserScreen from '../screens/SnacksForUserScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import SearchScreen from '../screens/SearchScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import UserSettingsScreen from '../screens/UserSettingsScreen';
import Environment from '../utils/Environment';
import defaultNavigationOptions from './defaultNavigationOptions';

const ProjectsStack = createStackNavigator(
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

const ExploreSearchSwitch = createBottomTabNavigator(
  {
    Explore: ExploreScreen,
    Search: SearchScreen,
  },
  {
    tabBarComponent: null,
    navigationOptions: ({ navigation }) => {
      let { routeName } = navigation.state.routes[navigation.state.index];

      return {
        header: null,
        title: routeName,
      };
    },
    defaultNavigationOptions: {
      tabBarVisible: false,
    },
  }
);

const ExploreStack = createStackNavigator(
  {
    ExploreAndSearch: ExploreSearchSwitch,
    Profile: ProfileScreen,
    ProjectsForUser: ProjectsForUserScreen,
    SnacksForUser: SnacksForUserScreen,
  },
  {
    initialRouteName: 'ExploreAndSearch',
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ focused }) => renderIcon(Ionicons, 'ios-search', 24, focused),
      tabBarLabel: 'Explore',
      tabBarOnPress: ({ navigation, defaultHandler }) => {
        if (!navigation.isFocused()) {
          defaultHandler();
          return;
        }

        navigation.popToTop();

        if (navigation.state.routes[0].index > 0) {
          navigation.navigate('Explore');
        } else {
          navigation.emit('refocus');
        }
      },
    },
    cardStyle: {
      backgroundColor: Colors.greyBackground,
    },
  }
);

const ProfileStack = createStackNavigator(
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

const DiagnosticsStack = createStackNavigator(
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

const TabNavigator = Platform.select({
  ios: createBottomTabNavigator(TabRoutes, {
    initialRouteName: Environment.IsIOSRestrictedBuild ? 'ProfileStack' : 'ProjectsStack',
    navigationOptions: {
      header: null,
    },
    tabBarOptions: {
      style: {
        backgroundColor: Colors.tabBar,
        borderTopColor: '#f2f2f2',
      },
    },
  }),
  android: createMaterialBottomTabNavigator(TabRoutes, {
    initialRouteName: 'ProjectsStack',
    activeTintColor: Colors.tabIconSelected,
    inactiveTintColor: Colors.tabIconDefault,
    navigationOptions: {
      header: null,
    },
    barStyle: {
      backgroundColor: '#fff',
    },
  }),
  web: createBottomTabNavigator(TabRoutes, {
    initialRouteName: 'ProfileStack',
    navigationOptions: {
      header: null,
    },
    tabBarOptions: {
      style: {
        backgroundColor: Colors.tabBar,
        borderTopColor: '#f2f2f2',
        // Doesn't work
        flexDirection: 'row',
      },
    },
  }),
});

const RootStack = createStackNavigator(
  {
    Tabs: TabNavigator,
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

export default Platform.select({ web: createBrowserApp, default: createAppContainer })(RootStack);

function renderIcon(IconComponent: any, iconName: string, iconSize: number, isSelected: boolean) {
  let color = isSelected ? Colors.tabIconSelected : Colors.tabIconDefault;

  return <IconComponent name={iconName} size={iconSize} color={color} style={styles.icon} />;
}

const styles = StyleSheet.create({
  icon: {
    marginBottom: Platform.OS === 'ios' ? -3 : 0,
  },
});
