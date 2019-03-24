import * as React from 'react';
import Gate from './rematch/Gate';

import MainNavigation from './navigation/MainNavigation';
import NavigationService from './navigation/NavigationService';

export default class App extends React.Component {
  render() {
    return (
      <Gate>
        <MainNavigation
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      </Gate>
    );
  }
}
