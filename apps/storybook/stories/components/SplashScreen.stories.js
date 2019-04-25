import { storiesOf } from '@storybook/react-native';
import React from 'react';

import UIExplorer, { Description } from '../ui-explorer';
import notes from './SplashScreen.notes.md';

const TITLE = 'SplashScreen';

storiesOf('Components', module).add(
  TITLE,
  () => (
    <UIExplorer title={TITLE}>
      <Description>
        A module that tells Expo to keep the splash screen visible until you make it hide.
      </Description>
    </UIExplorer>
  ),
  { notes }
);
