import React from 'react';
import { View } from 'react-native';

import NavigationService from '../navigation/NavigationService';
import InstaIcon from '../InstaIcon';

export default class CameraSettingsScreen extends React.Component {
  static navigationOptions = navigation => ({
    title: 'Story Controls',
    renderLeft: () => <InstaIcon name="cancel" color="black" onPress={() => navigation.goBack()} />,
  });
  render() {
    return <View />;
  }
}
