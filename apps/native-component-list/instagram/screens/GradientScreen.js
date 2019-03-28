import { LinearGradient } from 'expo';
import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  state = { useEffect: false };

  onEffectPressed = () => {
    this.setState({ useEffect: !this.state.useEffect });
  };
  render() {
    const {
      gradient,
      gradientTheme,
      onPressTypefaceButton,
      useGradientCamera,
      typeface,
    } = this.props;
    const opacity = this.state.useEffect ? 1 : 0.5;
    const isLight = gradientTheme === 'light';
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          style={[StyleSheet.absoluteFill, { opacity: useGradientCamera ? 0.5 : 1 }]}
          {...gradient}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={[
              {
                color: isLight ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
                fontSize: 28,
                // fontWeight: 'bold',
                textAlign: 'center',
                padding: 6,
                borderRadius: 4,
              },
              this.state.useEffect && { backgroundColor: isLight ? 'red' : 'white' },
              typeface.style,
            ]}>
            Tap to Type
          </Text>
          <Header>
            <IconButton name={'text-effect'} onPress={this.onEffectPressed} />
            <TypefaceButton title={typeface.name} onPress={onPressTypefaceButton} />
            <View />
          </Header>
        </View>
      </View>
    );
  }
}

export default TypeScreen;
