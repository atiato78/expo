import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '@storybook/react-native';

const TITLE = 'SplashScreen';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>
          <AppText>Desc</AppText>
        </Description>
      </UIExplorer>
    );
  }
}

import notes from './SplashScreen.notes.md';

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
