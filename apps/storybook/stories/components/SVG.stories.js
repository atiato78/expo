import { storiesOf } from '@storybook/react-native';
import React from 'react';

import UIExplorer, { AppText, Description } from '../ui-explorer';
import notes from './SVG.notes.md';

const TITLE = 'SVG';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>Description</Description>
      </UIExplorer>
    );
  }
}

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
