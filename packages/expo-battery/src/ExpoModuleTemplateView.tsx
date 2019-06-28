import * as React from 'react';

import { requireNativeViewManager } from '@unimodules/core';

export default class ExpoBatteryView extends React.Component {
  static NativeView = requireNativeViewManager('ExpoBatteryView');

  render() {
    return (
      <ExpoBatteryView.NativeView />
    );
  }
}
