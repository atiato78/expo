import React from 'react';

import UIExplorer, { AppText, Description } from '../ui-explorer';

const TITLE = 'Asset';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>
          <AppText>Desc</AppText>
        </Description>
      </UIExplorer>
    );
  }
}

// storiesOf('APIs', module).add(TITLE, () => <DemoScreen />, { notes });
