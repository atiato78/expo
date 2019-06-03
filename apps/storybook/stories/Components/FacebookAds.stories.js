import React from 'react';

import UIExplorer, { Description } from '../ui-explorer';

const TITLE = 'FacebookAds';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>Desc</Description>
      </UIExplorer>
    );
  }
}

// storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
