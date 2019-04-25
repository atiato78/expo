import { storiesOf } from '@storybook/react-native';
import React from 'react';

import UIExplorer, { AppText, Description } from '../ui-explorer';
import notes from './BarCodeScanner.notes.md';

const TITLE = 'BarCodeScanner';

storiesOf('Components', module).add(
  TITLE,
  () => (
    <UIExplorer title={TITLE}>
      <Description>Desc</Description>
    </UIExplorer>
  ),
  { notes }
);
