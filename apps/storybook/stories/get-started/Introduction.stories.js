import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '@storybook/react-native';

const TITLE = 'Intro';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>
          The Expo SDK provides access to device and system functionality such as contacts, camera,
          and GPS location. It is provided by the npm package
          [expo](https://www.npmjs.com/package/expo) &mdash; this is installed by default in every
          managed Expo project. You can import modules from it in your JavaScript code as follows:
        </Description>
      </UIExplorer>
    );
  }
}

import notes from './Introduction.notes.md';

storiesOf('Getting Started', module).add(TITLE, () => <DemoScreen />, { notes });
