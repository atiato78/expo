import React from 'react';

import UIExplorer, { AppText, Description } from '../ui-explorer';
import { storiesOf } from '@storybook/react-native';

const TITLE = 'WebBrowser';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>
          Provides access to the system's web browser and supports handling redirects. On iOS, it
          uses `SFSafariViewController` or `SFAuthenticationSession`, depending on the method you
          call, and on Android it uses `ChromeCustomTabs`. As of iOS 11, `SFSafariViewController` no
          longer shares cookies with the Safari, so if you are using `WebBrowser` for authentication
          you will want to use `WebBrowser.openAuthSessionAsync`, and if you just want to open a
          webpage (such as your app privacy policy), then use `WebBrowser.openBrowserAsync`.
        </Description>
      </UIExplorer>
    );
  }
}

import notes from './WebBrowser.notes.md';

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
