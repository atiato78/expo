import * as React from 'react';
import Gate from './rematch/Gate';

import Main from './CameraScreen';
export default class App extends React.Component {
  render() {
    return (
      <Gate>
        <Main />
      </Gate>
    );
  }
}
