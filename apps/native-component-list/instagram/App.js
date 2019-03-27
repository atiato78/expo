import * as React from 'react';
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Gate from './rematch/Gate';
import Stories from './components/Stories/Stories';
import MainNavigation from './navigation/MainNavigation';
import NavigationService from './navigation/NavigationService';

export default class App extends React.Component {
  render() {
    return (
      <Gate>
        <ActionSheetProvider>
          <ConnectedInnerApp />
        </ActionSheetProvider>
      </Gate>
    );
  }
}
class InnerApp extends React.Component {
  render() {
    const { offset, carouselOpen } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <MainNavigation
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
        <View
          style={[
            { overflow: 'hidden', ...StyleSheet.absoluteFillObject },
            // offset,
            carouselOpen ? { display: 'flex' } : { display: 'none' },
          ]}>
          <Stories />
        </View>
      </View>
    );
  }
}

const ConnectedInnerApp = connect(({ stories }) => ({ ...stories }))(InnerApp);
