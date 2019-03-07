import React from 'react';
import { View, Text, Image, Animated, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from './Slider';

import ViewPager from './ViewPager';

const pages = [
  // { name: 'Type', icon: null, screen: () => <TypeScreen /> },
  // { name: 'Music', icon: require('./inf.png') },
  // { name: 'Live', icon: null },
  // { name: 'Normal', icon: null },
  { name: 'Boomerang', icon: require('./inf.png') },
  { name: 'Rewind', icon: require('./rewind.png') },
  { name: 'Hands-Free', icon: require('./ball.png') },
].map(value => {
  return {
    ...value,
    name: value.name.toUpperCase(),
  };
});

const TypeScreen = () => {
  return (
    <LinearGradient
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      start={[0, 0]}
      end={[1, 1]}
      colors={['#15f5fd', '#b3eb50']}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', opacity: 0.7, textAlign: 'center' }}>
        Tap to Type
      </Text>
    </LinearGradient>
  );
};

export default class CameraScreen extends React.Component {
  state = {
    index: 0,
  };

  render() {
    const page = pages[this.state.index];
    return (
      <View style={{ flex: 1, backgroundColor: 'green' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {page.screen && page.screen()}
        </View>
        <View style={{ flex: 1 }} />

        <View
          style={{
            paddingHorizontal: 36,
            justifyContent: 'space-between',
            paddingVertical: 24,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <IconButton />
          <IconButton />
          <CaptureButton selectedIndex={this.state.index} icon={page.icon} />
          <IconButton />
          <IconButton />
        </View>

        <Slider
          data={pages.map(value => value.name)}
          onIndexChange={index => this.setState({ index })}
        />
      </View>
    );
  }
}

class CaptureButton extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    // if (this.props.icon !== prevProps.icon) {
    //   this.state.animation.start();
    // }
  }

  render() {
    const { selectedIndex, icon } = this.props;
    const width = 72;
    const innerWidth = width * 0.75;
    return (
      <TouchableOpacity style={{ height: width }}>
        <View
          style={{
            width,
            height: width,
            maxWidth: width,
            borderRadius: width / 2,
            backgroundColor: 'rgba(255,255,255,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: innerWidth,
              width: innerWidth,
              aspectRatio: 1,
              borderRadius: innerWidth / 2,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <RotatingIcon
              index={selectedIndex}
              data={pages.map(item => item.icon)}
              itemWidth={innerWidth}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

class RotatingIcon extends React.Component {
  state = { index: 0 };

  componentDidUpdate(prevProps) {
    if (this.props.index !== prevProps.index) {
      if (this.viewPager) {
        this.viewPager.scrollToIndex({ index: this.props.index, animated: true });
      }
    }
  }

  get currentPage() {
    return this.pages[this.viewPager.index];
  }

  previous = () => {
    if (this.viewPager) {
      console.log(this.viewPager.index);
      this.viewPager.previous();
    }
  };

  next = () => {
    if (this.viewPager) {
      console.log(this.viewPager.index);
      this.viewPager.next();
    }
  };

  renderItem = ({ item, index }) => {
    const { itemWidth } = this.props;
    const maxRotation = 80;
    const inputMargin = itemWidth * 0.333333333;
    if (!item) {
      return <View style={{ width: itemWidth }} />;
    }
    const animatedStyle = {
      width: itemWidth,
      height: itemWidth,
      padding: 4,
      transform: [
        {
          rotateY: this.animatedValue.interpolate({
            inputRange: [
              (index - 1) * itemWidth + inputMargin,
              index * itemWidth,
              (index + 1) * itemWidth - inputMargin,
            ],
            outputRange: [`-${maxRotation}deg`, '0deg', `${maxRotation}deg`],
          }),
        },
      ],
    };
    return (
      <Animated.View style={animatedStyle}>
        <Image style={{ flex: 1, resizeMode: 'contain' }} source={item} />
      </Animated.View>
    );
  };
  animatedValue = new Animated.Value(0);
  render() {
    const { itemWidth, data } = this.props;

    return (
      <ViewPager
        pagingEnabled
        pointerEvents={'none'}
        scroll={this.animatedValue}
        ref={ref => (this.viewPager = ref)}
        data={data}
        renderItem={this.renderItem}
        style={{
          minHeight: itemWidth,
          maxHeight: itemWidth,
          maxWidth: itemWidth,
          minWidth: itemWidth,
        }}
        size={itemWidth}
        horizontal
      />
    );
  }
}

const Icon = ({ name }) => <Text style={{ fontSize: 24 }}>{name}</Text>;

const iconButtonSize = 30;

const IconButton = ({ name }) => (
  <TouchableOpacity>
    <View
      style={{
        borderRadius: iconButtonSize / 2,
        width: iconButtonSize,
        height: iconButtonSize,
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: 'white',
      }}
    />
  </TouchableOpacity>
);
