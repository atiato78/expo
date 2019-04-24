import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '../utils/storybook';

const TITLE = 'GLView';

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

import notes from './GLView.notes.md';

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
