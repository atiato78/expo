import { storiesOf } from '@storybook/react-native';
import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import notes from './SVG.notes.md';
import { Svg } from 'expo';
import { color, number, object } from '@storybook/addon-knobs/react';

const TITLE = 'SVG';

storiesOf('Components', module).add(
  TITLE,
  () => {
    return (
      <UIExplorer title={TITLE}>
        <Section>
          <Svg height={100} width={100}>
            <Svg.Circle
              cx={number('circle cx', 50)}
              cy={number('circle cy', 50)}
              r={number('circle r', 45)}
              strokeWidth={number('circle strokeWidth', 2.5)}
              stroke={color('circle stroke', '#e74c3c')}
              fill={color('circle fill', '#f1c40f')}
            />
            <Svg.Rect
              x={number('rect x', 15)}
              y={number('rect y', 15)}
              width={number('rect width', 70)}
              height={number('rect height', 70)}
              strokeWidth={number('react strokeWidth', 2)}
              stroke={color('rect stroke', 'red')}
              fill={color('rect fill', 'blue')}
            />
          </Svg>
        </Section>
      </UIExplorer>
    );
  },
  { notes }
);
