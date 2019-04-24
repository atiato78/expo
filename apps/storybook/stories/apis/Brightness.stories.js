import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '@storybook/react-native';

const TITLE = 'Brightness';

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

import notes from './Brightness.notes.md';

storiesOf('APIs', module).add(TITLE, () => <DemoScreen />, { notes });
