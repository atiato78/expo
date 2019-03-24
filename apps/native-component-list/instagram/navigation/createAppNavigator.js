import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { View, Text } from 'react-native';
import InstaHeaderButton from '../InstaHeaderButton';
import CommentsScreen from '../screens/CommentsScreen';
import DetailsScreen from '../screens/DetailsScreen';
import UsersScreen from '../screens/UsersScreen';
import FollowingTabNavigator from './FollowingTabNavigator';

// import MediaAlbums from '../components/MediaLibrary/MediaAlbumsScreen';
// import MediaDetails from '../components/MediaLibrary/MediaDetailsScreen';
// import MediaLibrary from '../components/MediaLibrary/MediaLibraryScreen';

import InstaIcon from '../InstaIcon';

class Header extends React.Component {
  render() {
    const { navigationOptions = {} } = this.props;
    console.log(this.props);
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: 64,
          alignItems: 'center',
        }}>
        {navigationOptions.headerLeft && navigationOptions.headerLeft(navigationOptions)}

        <Text style={{ textAlign: 'center', fontSize: 16, color: 'black' }}>
          {navigationOptions.title}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <InstaIcon color={'black'} size={24} name={'send'} />
        </View>
        {navigationOptions.headerRight && navigationOptions.headerRight(navigationOptions)}
      </View>
    );
  }
}

function createAppNavigator(screen, name) {
  return createStackNavigator(
    {
      // MediaLibrary,
      // MediaAlbums,
      // MediaDetails,
      [name]: screen,
      // Media: { screen: MediaScreen, navigationOptions: { header: null } },
      [`${name}_Followers`]: {
        screen: UsersScreen,
        navigationOptions: { title: 'Followers' },
      },
      [`${name}_Following`]: {
        screen: FollowingTabNavigator,
        navigationOptions: { title: 'Following' },
      },
      [`${name}_Users`]: UsersScreen,
      [`${name}_Details`]: {
        screen: DetailsScreen,
        navigationOptions: {
          title: 'Photo',
        },
      },
      [`${name}_Comments`]: {
        screen: CommentsScreen,
        navigationOptions: { title: 'Comments' },
      },
    },
    {
      cardStyle: { backgroundColor: 'white' },
      defaultNavigationOptions: () => ({
        headerBackImage: () => <InstaIcon name={'chevron-left'} size={30} color={'black'} />,
        headerTintColor: 'black',
        headerStyle: {
          borderBottomWidth: 0.5,
          borderBottomColor: 'rgba(0,0,0,0.098)',
        },
        headerRight: <InstaHeaderButton name={'flip'} />,
        // header: props => <Header {...props} />,
      }),
    }
  );
}

export default createAppNavigator;
