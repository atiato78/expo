import { configure, addParameters, addDecorator } from '@storybook/react';
import { create } from '@storybook/theming';
import { withTests } from '@storybook/addon-jest';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import requireContext from 'require-context.macro';
import centered from './decorator-centered';
import * as React from 'react';

addDecorator(centered);

// addDecorator(withA11y);
addDecorator(withKnobs({ escapeHTML: false, skipIfNoParametersOrOptions: true }));

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

import UIExplorer, {
  AppText,
  Code,
  storiesOf,
  Description,
  DocItem,
  Section,
} from '../stories/ui-explorer';

function loadStories() {
  // require('../stories/apis/Accelerometer.stories');
  // require('../stories/components/LinearGradient.stories');
  // require('../stories/get-started/Introduction.stories');
  // automatically import all story js files that end with *.stories.js
  const req = requireContext('../stories', true, /\.stories\.js$/);
  // const req = requireContext('../stories', true, /\.stories\.js$/);
  req.keys().forEach(filename => {
    const module = req(filename);
    if (module.component && module.kind) {
      const { component: Component, packageJson, notes, description, title, kind } = module;
      console.log('filename', filename, module, Component);
      const screen = (props = {}) => (
        <UIExplorer title={title} description={description || packageJson.description}>
          <Component {...props} />
        </UIExplorer>
      );
      storiesOf(kind, global.module).add(title, screen, { notes });
    }
    // req(filename)
  });
}

configure(loadStories, module);
