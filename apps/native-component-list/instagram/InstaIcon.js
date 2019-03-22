import React from 'react';
import { Image } from 'react-native';

import Assets from './Assets';

export default class InstaIcon extends React.PureComponent {
  render() {
    const { name, color = 'white', style, ...props } = this.props;
    if (!name) {
      return null;
    }
    const colorStyle = [{ tintColor: color, flex: 1 }, style];
    const icon = Assets.icons[name + '.png'];
    console.log(name, icon);
    return <Image source={icon} style={colorStyle} {...props} />;
  }
}
