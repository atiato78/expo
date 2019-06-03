import React from 'react';

import UIExplorer, { Description } from '../ui-explorer';

const TITLE = 'SMS';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>Desc</Description>
      </UIExplorer>
    );
  }
}

// storiesOf('APIs', module).add(TITLE, () => <DemoScreen />, { notes });
