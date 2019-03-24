import React from 'react';
import { TouchableOpacity } from 'react-native';
import InstaIcon from './InstaIcon';

export default class InstaHeaderButton extends React.PureComponent {
  render() {
    const { onPress, ...props } = this.props;
    return (
      <TouchableOpacity style={{ marginHorizontal: 18 }} onPress={onPress}>
        <InstaIcon size={24} color={'black'} {...props} />
      </TouchableOpacity>
    );
  }
}
