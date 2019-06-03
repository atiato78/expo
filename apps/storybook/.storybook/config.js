import { configure, addParameters, addDecorator } from '@storybook/react';
import { create } from '@storybook/theming';
import { withTests } from '@storybook/addon-jest';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import requireContext from 'require-context.macro';
import centered from './decorator-centered';
import * as React from 'react';
import path from 'path';

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
  // automatically import all story js files that end with *.stories.js
  const req = requireContext('../stories', true, /\.stories\.jsx?$/);
  const mdreq = requireContext('../stories', true, /\.notes\.md$/);

  function loadModule(filename) {
    const module = req(filename);
    if (!module.component || !module.kind) {
      return;
    }
    const { component: Component, packageJson, notes, description, title, kind } = module;

    let markdown = notes;
    if (!notes) {
      const mdPath = filename.substr(0, filename.lastIndexOf('.stories')) + '.notes.md';
      markdown = mdreq(mdPath);
    }

    const screen = (props = {}) => (
      <UIExplorer title={title} description={description || packageJson.description}>
        <Component {...props} />
      </UIExplorer>
    );
    storiesOf(kind, global.module).add(title, screen, { notes: { markdown } });
  }

  // loadModule('./apis/Accelerometer.stories.jsx');

  req.keys().forEach(filename => loadModule(filename));
}

configure(loadStories, module);
