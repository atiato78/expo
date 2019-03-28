import { LinearGradient } from 'expo';
import Constants from 'expo-constants';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FaceButton from '../components/FaceButton';
import IconButton from '../components/IconButton';
import InstaIcon from '../components/InstaIcon';
import NavigationService from '../navigation/NavigationService';
import dispatch from '../rematch/dispatch';

const GradientHeader = ({ style, ...props }) => (
  <LinearGradient
    colors={['black', 'red']}
    style={StyleSheet.flatten([
      {
        position: 'absolute',
        top: 0,
        paddingTop: Constants.statusBarHeight || 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 12,
      },
      style,
    ])}
    {...props}
  />
);

export default class EditorScreen extends React.Component {
  render() {
    const sendButtonHeight = 36;

    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]}>
        <Image style={{ flex: 1, resizeMode: 'cover' }} source={this.props.image} />
        <GradientHeader>
          <EditorIcon
            name={'cancel'}
            onPress={() => {
              dispatch().image.set(null);
            }}
          />
          <View style={{ flexDirection: 'row' }}>
            <EditorIcon name="save" onPress={() => {}} />
            <FaceButton
              containerStyle={{ marginHorizontal: 4 }}
              onPress={() => NavigationService.navigate('SocialUI')}
            />
            <EditorIcon name="stickers" onPress={() => NavigationService.navigate('SocialUI')} />
            <EditorIcon name="draw" onPress={() => NavigationService.navigate('SocialUI')} />
            <EditorIcon name="letter" onPress={() => NavigationService.navigate('SocialUI')} />
          </View>
        </GradientHeader>

        <View
          style={{
            display: 'flex',
            paddingVertical: 24,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
          }}>
          <View />
          <TouchableOpacity style={{}}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                height: sendButtonHeight,
                borderRadius: sendButtonHeight / 2,
                shadowRadius: 6,
                shadowOpacity: 0.3,
                paddingHorizontal: 12,
                flexDirection: 'row',
              }}>
              <Text style={{ textAlign: 'left', marginBottom: 2, fontSize: 12 }} onPress={() => {}}>
                Send To
              </Text>
              <InstaIcon name="chevron-right" color="black" size={18} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const EditorIcon = ({ style, ...props }) => (
  <IconButton containerStyle={[{ marginHorizontal: 4 }, style]} color="white" {...props} />
);
