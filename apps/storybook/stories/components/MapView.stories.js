import { storiesOf } from '@storybook/react-native';
import React from 'react';

import UIExplorer, { Description } from '../ui-explorer';
import notes from './MapView.notes.md';

const TITLE = 'MapView';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>Description</Description>
      </UIExplorer>
    );
  }
}

// storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
