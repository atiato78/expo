import { color, number } from '@storybook/addon-knobs/react';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

import UIExplorer, { DocItem, Section } from '../ui-explorer';

export const title = 'Linear Gradient';
export const kind = 'Components';
export const packageJson = require('expo-linear-gradient/package.json');
export { default as notes } from './LinearGradient.notes.md';

export const component = () => {
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
    <View>
      <DocItem
        name="Importing the module"
        example={{
          code: `import { LinearGradient } from 'expo-linear-gradient';`,
        }}
      />
      <Section title="Playground">
        <LinearGradient style={{ flex: 1, minHeight: 200, maxHeight: 200 }} {...props} />
      </Section>
    </View>
  );
};
