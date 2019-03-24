import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import InstaIcon from '../InstaIcon';
import { profileImageSize } from './FeedList';

export class ItemHeader extends React.Component {
  render() {
    const { name, location, source } = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 0.5,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            style={{
              aspectRatio: 1,
              minHeight: profileImageSize,
              height: profileImageSize,
              backgroundColor: '#d8d8d8',
              width: profileImageSize,
              borderRadius: profileImageSize / 2,
              marginRight: 12,
              resizeMode: 'cover',
            }}
            source={source}
          />
          <View>
            <Text style={{ fontSize: 14, color: '#262626', fontWeight: '600' }}>{name}</Text>
            <Text style={{ fontSize: 12, color: '#262626' }}>{location || 'Legoland'}</Text>
          </View>
        </View>
        <InstaIcon name="more" size={36} color={'black'} />
      </View>
    );
  }
}
