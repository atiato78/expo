import React, { PureComponent } from 'react';
import { FlatList, Text, View } from 'react-native';

import InstaIcon from '../InstaIcon';
import { Item } from './Item';
import LikeButton from './LikeButton';
import Stories from '../components/Stories';

const user = 'baconbrix';
const people = [
  { title: 'Your Story', account: user },
  'ccheever',
  'jameside',
  'notbrent',
  'quinlanjung',
  'tzhongg',
  'i_am_nader',
  'theavocoder',
];

const stories = people.map(name => {
  let account = name.account || name;
  let title = name.title || account;
  return {
    key: account,
    source: {
      uri: `https://avatars.io/instagram/${account}/Small`,
    },
    title,
  };
});

class Footer extends PureComponent {
  render() {
    const height = 36;
    return (
      <View style={{ justifyContent: 'center', paddingVertical: 12, alignItems: 'center' }}>
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
        ListHeaderComponent={props => <Stories stories={stories} />}
        renderItem={({ item }) => <Item {...item} />}
        ListFooterComponent={props => <Footer {...props} onPress={onPressFooter} />}
        keyExtractor={item => item.key}
        {...props}
      />
    );
  }
}
