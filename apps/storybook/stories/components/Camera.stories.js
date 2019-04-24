import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '../utils/storybook';
import { Camera } from 'expo-camera';
const TITLE = 'Camera';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>
          <AppText>Desc</AppText>
        </Description>
        <Camera
          style={{ flex: 1, minHeight: 300 }}
          ref={ref => {
            this.camera = ref;
          }}
        />
      </UIExplorer>
    );
  }
}

import notes from './Camera.notes.md';

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
