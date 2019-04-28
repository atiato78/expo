import { storiesOf } from '@storybook/react-native';
import React from 'react';

import UIExplorer, { Description } from '../ui-explorer';
import notes from './Sharing.notes.md';

const TITLE = 'Sharing';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>Desc</Description>
      </UIExplorer>
    );
  }
}

// storiesOf('APIs', module).add(TITLE, () => <DemoScreen />, { notes });
