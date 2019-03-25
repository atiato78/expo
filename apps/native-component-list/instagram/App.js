import * as React from 'react';
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import Gate from './rematch/Gate';

import MainNavigation from './navigation/MainNavigation';
import NavigationService from './navigation/NavigationService';

export default class App extends React.Component {
  render() {
    return (
      <Gate>
        <ActionSheetProvider>
          <MainNavigation
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
          />
        </ActionSheetProvider>
      </Gate>
    );
  }
}
