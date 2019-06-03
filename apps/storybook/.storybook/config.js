import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator, addParameters, configure } from '@storybook/react';
import { create } from '@storybook/theming';
import * as React from 'react';
import requireContext from 'require-context.macro';

import UIExplorer, { storiesOf } from '../stories/ui-explorer';
import centered from './decorator-centered';

addDecorator(centered);

// addDecorator(withKnobs({ escapeHTML: false, skipIfNoParametersOrOptions: true }));

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

let storiesCache = {};

function loadStories() {
  // automatically import all story js files that end with *.stories.js
  const req = requireContext('../stories', true, /\.stories\.jsx?$/);
  const mdreq = requireContext('../stories', true, /\.notes\.md$/);

  function loadModule(filename) {
    const module = req(filename);
    if (!module.component) {
      return;
    }
    const {
      component: Component,
      packageJson = {},
      notes,
      description,
      title,
      kind,
      hasKnobs,
      onStoryCreated,
    } = module;

    let markdown = notes;
    if (!notes) {
      const mdPath = filename.substr(0, filename.lastIndexOf('.stories')) + '.notes.md';
      markdown = mdreq(mdPath);
    }

    const screen = (props = {}) => (
      <UIExplorer
        title={title}
        description={description || packageJson.description}
        packageName={packageJson.name}>
        <Component {...props} />
      </UIExplorer>
    );

    const storiesKind = kind || filename.split('/')[1];
    let stories = storiesCache[storiesKind];
    if (!stories) {
      stories = storiesOf(storiesKind, global.module);
      storiesCache[storiesKind] = stories;
    }
    if (hasKnobs) {
      stories.addDecorator(withKnobs({ escapeHTML: false, skipIfNoParametersOrOptions: true }));
    }
    stories.add(title, screen, {
      notes: { markdown },
    });
    if (onStoryCreated) {
      onStoryCreated({ stories });
    }
  }

  // loadModule('./apis/Accelerometer.stories.jsx');

  req.keys().forEach(filename => loadModule(filename));
}

configure(loadStories, module);
