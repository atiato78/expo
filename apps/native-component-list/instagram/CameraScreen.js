import React from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { SafeAreaView, createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';
import { SearchBar } from 'react-native-elements';
import Slider from './Slider';
import ViewPager from './ViewPager';

const { height } = Dimensions.get('window');

const pages = [
  { name: 'Type', icon: null, screen: () => <TypeScreen /> },
  { name: 'Music', hideFooter: true, icon: require('./inf.png'), screen: () => <MusicScreen /> },
  { name: 'Live', icon: null },
  { name: 'Normal', icon: null },
  { name: 'Boomerang', icon: require('./inf.png') },
  { name: 'Rewind', icon: require('./rewind.png') },
  { name: 'Hands-Free', icon: require('./ball.png') },
].map(value => {
  return {
    ...value,
    name: value.name.toUpperCase(),
  };
});

const Header = ({ style, ...props }) => (
  <View
    style={StyleSheet.flatten([
      {
        position: 'absolute',
        top: Constants.statusBarHeight || 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      },
      style,
    ])}
    {...props}
  />
);

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
      <Header>
        <IconButton />
        <IconButton />
        <View />
      </Header>
    </LinearGradient>
  );
};

const CameraScreen = () => {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Camera style={{ flex: 1 }} />
      <Header>
        <IconButton />
        <IconButton />
      </Header>
    </View>
  );
};
const MusicScreen = () => {
  return (
    <BlurView tint={'dark'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <SafeAreaView>
        <SearchBar
          round
          containerStyle={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}
          inputStyle={{ color: 'white' }}
          placeholder="Search music"
        />
        <MusicNav />
      </SafeAreaView>
    </BlurView>
  );
};

const listItemImageSize = 56;
const ListScreenItem = ({ renderImage, title, subtitle, renderAction, onPress }) => (
  <View
    style={{
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      {renderImage({
        style: {
          shadowOpacity: 0.4,
          shadowRadius: 6,
          width: listItemImageSize,
          height: listItemImageSize,
          borderRadius: 5,
          backgroundColor: 'gray',
        },
      })}
      <View style={{ justifyContent: 'space-between', marginLeft: 12 }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{title}</Text>
        {subtitle && (
          <Text style={{ marginTop: 4, color: 'white', opacity: 0.7, fontSize: 14 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {renderAction()}
  </View>
);

const SongListScreenItem = ({ title, artist, image }) => (
  <ListScreenItem
    renderImage={({ style }) => <Image style={style} resizeMode="cover" source={image} />}
    title={title}
    subtitle={artist}
    renderAction={() => <IconButton />}
  />
);
const GenreListScreenItem = ({ genre, image }) => (
  <ListScreenItem
    renderImage={({ style }) => (
      <View style={StyleSheet.flatten([style, { padding: 12 }])}>
        <Image style={{ flex: 1, tintColor: 'white' }} resizeMode={'contain'} source={image} />
      </View>
    )}
    title={genre}
    renderAction={() => <IconButton />}
  />
);

const ListScreen = props => (
  <FlatList
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingBottom: 60 }}
    {...props}
    renderItem={({ item }) => {
      if (item.genre) {
        return <GenreListScreenItem {...item} />;
      }
      return <SongListScreenItem {...item} />;
    }}
  />
);

// const GenreScreen = createStackNavigator({
//   GenreScreen: {
//     screen: () => <ListScreen data={[]} />,
//     navigationOptions: { header: null },
//   },
//   MusicScreen: () => <ListScreen data={[]} />,
// });

const reformatGenres = d =>
  d.map(genre => ({
    genre,
    image: {
      uri: 'https://png.pngtree.com/svg/20170526/mic_icon_525549.png',
    },
  }));

const moods = reformatGenres([
  'Fun',
  'Upbeat',
  'Dreamy',
  'Romantic',
  'Bold',
  'Mellow',
  'Inspirational',
  'Suspenseful',
]);

const genres = reformatGenres([
  'Christmas',
  'Hip Hop',
  'R&B and Soul',
  'Rock',
  'Pop',
  'Country',
  'Latin',
  'Electronic',
  'Jazz',
  'Classical',
  'Reggae',
  'Ambient',
  'Folk',
  'Indian',
  'Cinematic',
]);

const GenreScreen = () => <ListScreen data={genres} />;
const MoodScreen = () => <ListScreen data={moods} />;
const PopularScreen = () => (
  <ListScreen
    data={[
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
      aSong,
    ]}
  />
);
const aSong = {
  title: 'Wow.',
  artist: 'Post Malone',
  isExplict: true,
  image: { uri: 'https://pbs.twimg.com/profile_images/991091895014187008/H0os_Ljz_400x400.jpg' },
};

const MusicNav = createAppContainer(
  createMaterialTopTabNavigator(
    {
      Popular: PopularScreen,
      Moods: MoodScreen,
      Genres: GenreScreen,
    },
    {
      style: {
        maxHeight: height - (48 + 8), // Tab Bar Height + padding
      },
      tabBarOptions: {
        swipeEnabled: true,
        activeTintColor: 'white',
        inactiveBackgroundColor: 'transparent',
        safeAreaInset: 'never',
        upperCaseLabel: false,
        scrollEnabled: false,
        indicatorStyle: {
          backgroundColor: 'white',
          height: 3,
        },
        style: {
          backgroundColor: 'transparent',
          borderWidth: 0,
          shadowOpacity: 0,
          overflow: 'hidden',
        },
        labelStyle: {
          fontWeight: 'bold',
        },
      },
    }
  )
);

export default class CameraContainerScreen extends React.Component {
  state = {
    index: 0,
  };

  render() {
    const page = pages[this.state.index];
    return (
      <View style={{ flex: 1, backgroundColor: 'green', justifyContent: 'flex-end' }}>
        <CameraScreen />

        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {page.screen && page.screen()}
        </View>

        <MainFooter page={page} index={this.state.index} />
        <Slider
          data={pages.map(value => value.name)}
          onIndexChange={index => {
            console.log(index);
            this.setState({ index });
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: 15,
              height: 15,
              borderTopLeftRadius: 2,
              backgroundColor: 'white',
              transform: [{ rotate: '45deg' }, { translateX: '50%' }, { translateY: '50%' }],
            }}
          />
        </View>
      </View>
    );
  }
}

class MainFooter extends React.Component {
  render() {
    const { page, index } = this.props;
    return (
      <View
        style={{
          display: page.hideFooter ? 'none' : 'flex',
          paddingHorizontal: 36,
          justifyContent: 'space-between',
          paddingVertical: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <GalleryButton
          source={{
            uri: 'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
          }}
        />
        <IconButton />
        <CaptureButton selectedIndex={index} icon={page.icon} />
        <IconButton />
        <IconButton />
      </View>
    );
  }
}

class CaptureButton extends React.Component {
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
        <BlurView
          tint={'light'}
          style={{
            width,
            height: width,
            maxWidth: width,
            borderRadius: width / 2,
            backgroundColor: 'transparent',
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
        </BlurView>
      </TouchableOpacity>
    );
  }
}

const GalleryButton = ({ source }) => {
  const size = 36;
  return (
    <TouchableOpacity style={{ width: size, height: size }} onPress={() => {}}>
      <Image
        source={source}
        style={{
          flex: 1,
          resizeMode: 'contain',
          borderRadius: 4,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'white',
        }}
      />
    </TouchableOpacity>
  );
};

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
