import React from 'react';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import { Button, View } from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import ExploreScreen from '../screens/ExploreScreen';
import FeedScreen from '../screens/FeedScreen';
import MediaScreen from '../screens/MediaScreen';
import EditMediaScreen from '../screens/EditMediaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import createAppNavigator from './createAppNavigator';
import LikesTabNavigator from './LikesTabNavigator';

MediaScreen.navigationOptions = {
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="capture" />,
};

const mediaStack = createStackNavigator(
  {
    MediaScreen: {
      screen: MediaScreen,
      navigationOptions: ({ navigation }) => {
        // const goToAlbums = () => navigation.navigate('MediaAlbums');
        // const clearAlbumSelection = () => navigation.pop(2);
        // const { params } = navigation.state;
        // const isAlbumSet = params && params.album;

        return {
          title: 'Camera Roll',
          headerRight: (
            <View style={{ marginRight: 5 }}>
              <Button
                title="Next"
                onPress={() => {
                  navigation.navigate('EditMedia');
                }}
              />
            </View>
          ),
        };
      },
    },
    EditMedia: {
      screen: EditMediaScreen,
    },
  },
  {
    initialRouteName: 'EditMedia',
  }
);

const FeedNav = createAppNavigator(FeedScreen, 'Feed');
FeedNav.navigationOptions = {
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="home" />,
};

const ExploreNav = createAppNavigator(ExploreScreen, 'Explore');
ExploreNav.navigationOptions = {
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="search" />,
};
const ProfileNav = createAppNavigator(ProfileScreen, 'Profile');
ProfileNav.navigationOptions = {
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="profile" />,
};

const LikesNav = createAppNavigator(LikesTabNavigator, 'Likes');
LikesNav.navigationOptions = {
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="like" />,
};

export default createBottomTabNavigator(
  {
    Feed: FeedNav,
    Explore: ExploreNav,
    Media: { screen: mediaStack },
    Likes: LikesNav,
    Profile: ProfileNav,
  },
  {
    initialRouteName: 'Feed',
    tabBarOptions: {
      showLabel: false,
    },
  }
);
