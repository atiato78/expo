import { Ionicons } from '@expo/vector-icons';
import React, { PureComponent } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Item } from './Item';
import InstaIcon from '../InstaIcon';

class Footer extends PureComponent {
  render() {
    return (
      <View>
        <Text onPress={this.props.onPress}>Load More...</Text>
      </View>
    );
  }
}

export const profileImageSize = 48;

export class IconBar extends React.Component {
  render() {
    return (
      <View style={{ flexDirection: 'row', height: 36, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name="like" />
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
