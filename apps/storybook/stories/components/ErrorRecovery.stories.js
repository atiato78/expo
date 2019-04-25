import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '@storybook/react-native';
import { object } from '@storybook/addon-knobs/react';

const TITLE = 'ErrorRecovery';
import { ErrorRecovery } from 'expo';

class DemoScreen extends React.Component {
  render() {
    ErrorRecovery.setRecoveryProps(object('Recovery', {}));
    return (
      <UIExplorer title={TITLE}>
        <Description>
          Utilities for helping you gracefully handle crashes due to fatal JavaScript errors.
        </Description>
        <Section>
          <DocItem
            name="setRecoveryProps"
            typeInfo="props: Object"
            description="Set arbitrary error recovery props. If your project crashes in production as a result of a fatal JS error, Expo will reload your project. If you've set these props, they'll be passed to your reloaded project's initial props under exp.errorRecovery."
            example={{
              render: () => (
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <ErrorRecovery />
                </View>
              ),
            }}
          />
        </Section>
      </UIExplorer>
    );
  }
}

import notes from './ErrorRecovery.notes.md';

storiesOf('Components', module).add(
  TITLE,
  () => {
    ErrorRecovery.setRecoveryProps(object('Recovery', {}));
    return (
      <UIExplorer title={TITLE}>
        <Description>
          Utilities for helping you gracefully handle crashes due to fatal JavaScript errors.
        </Description>
        <Section>
          <DocItem
            name="setRecoveryProps"
            typeInfo="props: Object"
            description="Set arbitrary error recovery props. If your project crashes in production as a result of a fatal JS error, Expo will reload your project. If you've set these props, they'll be passed to your reloaded project's initial props under exp.errorRecovery."
            example={{
              render: () => (
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <ErrorRecovery>
                    <Description>Inner app content</Description>
                  </ErrorRecovery>
                </View>
              ),
            }}
          />
        </Section>
      </UIExplorer>
    );
  },
  { notes }
);
