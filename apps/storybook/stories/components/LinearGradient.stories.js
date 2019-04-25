import { color, number } from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

import UIExplorer, { Description, DocItem, Section } from '../ui-explorer';
import notes from './LinearGradient.notes.md';

const TITLE = 'Linear Gradient';

storiesOf('Components', module).add(
  TITLE,
  () => {
    const options = {
      range: true,
      min: 0.0,
      max: 1.0,
      step: 0.05,
    };

    const colors = [color('colors 0', 'red'), color('colors 1', 'blue')];

    const props = {
      colors,
      start: {
        x: number('start x', 0.5, options),
        y: number('start y', 0.0, options),
      },
      end: {
        x: number('end x', 0.5, options),
        y: number('end y', 1.0, options),
      },
      locations: [number('locations 0', 0, options), number('locations 1', 1, options)],
    };
    return (
      <UIExplorer title={TITLE}>
        <Description>A React component that renders a gradient view.</Description>
        <DocItem
          name="Importing the module"
          example={{
            code: `import { LinearGradient } from 'expo-linear-gradient';`,
          }}
        />
        <Section title="Playground">
          <LinearGradient style={{ flex: 1, height: 200 }} {...props} />
        </Section>
      </UIExplorer>
    );
  },
  { notes }
);
