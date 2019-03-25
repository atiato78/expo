import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import InstaIcon from '../InstaIcon';
import { profileImageSize } from './FeedList';
import InstaHeaderButton from '../InstaHeaderButton';

@connectActionSheet
class ItemHeader extends React.Component {
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
        <InstaHeaderButton
          name="more"
          size={36}
          color={'black'}
          onPress={() => {
            const options = [
              'Copy Link',
              'Turn On Post Notifications',
              'Report',
              'Mute',
              'Unfollow',
              'Cancel',
            ];
            // TODO: Bacon: Add more destructive options
            const destructiveButtonIndex = options.length - 2;
            const cancelButtonIndex = options.length - 1;

            this.props.showActionSheetWithOptions(
              {
                options,
                cancelButtonIndex,
                destructiveButtonIndex,
                // title,
                // message,
                // icons, // Android only
                // tintIcons: true, // Android only; default is true
                // showSeparators: withSeparators, // Affects Android only; default is false
                // textStyle, // Android only
                // titleTextStyle, // Android only
                // messageTextStyle, // Android only
              },
              buttonIndex => {
                // Do something here depending on the button index selected
                // onSelection(buttonIndex);
              }
            );
          }}
        />
      </View>
    );
  }
}

export { ItemHeader };
