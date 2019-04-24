import path from 'path';
import { render as renderer } from 'enzyme';
import { createSerializer as enzymeSerializer } from 'enzyme-to-json';
import { createSerializer as emotionSerializer } from 'jest-emotion';

import initStoryshots, { multiSnapshotWithOptions } from '@storybook/addon-storyshots';

initStoryshots({
  framework: 'react',
  configPath: path.join(__dirname, '..', '.storybook'),
  integrityOptions: { cwd: __dirname },
  test: multiSnapshotWithOptions({
    renderer,
  }),
  snapshotSerializers: [enzymeSerializer(), emotionSerializer()],
});
