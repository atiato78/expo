import { storiesOf } from '@storybook/react';
import React from 'react';

import UIExplorer, { Description } from '../ui-explorer';

const TITLE = 'AppAuth';

storiesOf('APIs', module).add(
  TITLE,
  () => (
    <UIExplorer title={TITLE}>
      <Description>App Auth Desc</Description>
    </UIExplorer>
  )
  // { notes }
);
