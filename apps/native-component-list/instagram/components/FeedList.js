import React, { PureComponent } from 'react';
import { FlatList, Text, View } from 'react-native';

import InstaIcon from '../InstaIcon';
import { Item } from './Item';
import LikeButton from './LikeButton';

class Footer extends PureComponent {
  render() {
    const height = 36;
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            height,
            borderRadius: height / 2,
            shadowRadius: 6,
            shadowOpacity: 0.3,
            paddingHorizontal: 12,
          }}>
          <Text style={{ textAlign: 'center' }} onPress={this.props.onPress}>
            Load More...
          </Text>
        </View>
      </View>
    );
  }
}

export const profileImageSize = 30;

export class IconBar extends React.Component {
  render() {
    return (
      <View style={{ flexDirection: 'row', height: 36, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          <LikeButton size={36} />
          <Icon name="chat" />
          <Icon name="send" />
        </View>
        <Icon name="bookmark" />
      </View>
    );
  }
}

export const Icon = ({ name }) => <InstaIcon size={36} name={name} color={'black'} />;

export default class FeedList extends React.Component {
  render() {
    const { onPressFooter, ...props } = this.props;
    return (
      <FlatList
        renderItem={({ item }) => <Item {...item} />}
        ListFooterComponent={props => <Footer {...props} onPress={onPressFooter} />}
        keyExtractor={item => item.key}
        {...props}
      />
    );
  }
}
