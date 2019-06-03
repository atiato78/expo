import { configure, addParameters, addDecorator } from '@storybook/react';
import { create } from '@storybook/theming';
import { withTests } from '@storybook/addon-jest';
import { withKnobs } from '@storybook/addon-knobs/react';
import { withA11y } from '@storybook/addon-a11y';
import requireContext from 'require-context.macro';
import centered from './decorator-centered';

addDecorator(centered);
addDecorator(withA11y);
addDecorator(withKnobs({ escapeHTML: false }));
addParameters({
  options: {
    isFullscreen: false,
    showAddonsPanel: true,
    showSearchBox: false,
    panelPosition: 'right',
    sortStoriesByKind: true,
    hierarchySeparator: /\./,
    hierarchyRootSeparator: /\|/,
    enableShortcuts: true,
    theme: create({
      base: 'light',
      brandTitle: 'Expo',
      brandUrl: 'https://github.com/expo/expo/tree/master/apps/storybook',
      gridCellSize: 12,
    }),
  },
});

function loadStories() {
  require('../stories/apis/AppAuth.stories');
  // require('../stories/get-started/Introduction.stories');
  // automatically import all story js files that end with *.stories.js
  const req = requireContext('../stories', true, /\.stories\.js$/);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
