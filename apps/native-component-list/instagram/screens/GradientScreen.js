import { LinearGradient } from 'expo';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import IconButton from '../components/IconButton';
import Header from '../components/MediaHeader';

const typefaceButtonSize = 36;
class TypefaceButton extends React.Component {
  render() {
    const { onPress, title } = this.props;
    return (
      <TouchableOpacity style={{ height: typefaceButtonSize }} onPress={onPress}>
        <View
          style={{
            borderWidth: 2,
            borderRadius: typefaceButtonSize + 4,
            borderColor: 'white',
            paddingVertical: 4,
            paddingHorizontal: 16,
            minWidth: 80,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
          }}>
          <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
            {title.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

class TypeScreen extends React.Component {
  render() {
    const { gradient, gradientTheme, onPressTypefaceButton, typeface } = this.props;
    return (
      <LinearGradient
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        {...gradient}>
        <Text
          style={{
            fontFamily: typeface.fontFamily,
            color: gradientTheme === 'light' ? 'white' : 'black',
            fontSize: 28,
            // fontWeight: 'bold',
            opacity: 0.5,
            textAlign: 'center',
          }}>
          Tap to Type
        </Text>
        <Header>
          <IconButton name={'text-effect'} />
          <TypefaceButton title={typeface.name} onPress={onPressTypefaceButton} />
          <View />
        </Header>
      </LinearGradient>
    );
  }
}

export default TypeScreen;
