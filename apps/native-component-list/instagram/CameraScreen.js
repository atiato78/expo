import React from 'react';
import {
  View,
  Platform,
  Text,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { BlurView } from 'expo-blur';
import {
  SafeAreaView,
  createStackNavigator,
  createMaterialTopTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { SearchBar } from 'react-native-elements';
import * as Font from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Slider from './Slider';
import ViewPager from './ViewPager';

import Popular from './data/Popular-itunes.json';
// import Popular from './data/Popular.json';
import Moods from './data/Moods.json';
import Genres from './data/Genres.json';
import InstaIcon from './InstaIcon';
import Assets from './Assets';

const { height } = Dimensions.get('window');

const pages = [
  {
    name: 'Type',
    icon: null,
    id: 'type',
    screen: props => <TypeScreen {...props} />,
    headerLeftIconName: null,
  },
  { name: 'Music', hideFooter: true, icon: Assets['inf.png'], screen: () => <MusicScreen /> },
  { name: 'Live', icon: null, id: 'live' },
  { name: 'Normal', icon: null },
  { name: 'Boomerang', icon: Assets['inf.png'] },
  { name: 'Superzoom', icon: Assets['rewind.png'] },
  { name: 'Focus', icon: Assets['inf.png'] },
  { name: 'Rewind', icon: Assets['rewind.png'] },
  { name: 'Hands-Free', icon: Assets['ball.png'] },
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

const types = [
  {
    name: 'Strong',
    fontFamily: 'insta-strong',
  },
  {
    name: 'Modern',
    fontFamily: 'insta-modern',
  },
  {
    name: 'Neon',
    fontFamily: 'insta-neon',
  },
  {
    name: 'Typewriter',
    fontFamily: 'insta-typewriter',
  },
];

const gradients = [
  {
    start: [1, 0],
    end: [0, 0.9],
    colors: ['#E4C9BF', '#E89D99', '#DF6D71'],
    theme: 'light',
  },
  {
    start: [1, 0],
    end: [0, 1],
    colors: ['#62BFEA', '#76CEF5', '#82BFD7'],
    theme: 'light',
  },
  {
    start: [0, 0],
    end: [1, 1],
    colors: ['#F3F4F2', '#BDBDBC'],
    theme: 'dark',
  },
  {
    start: [0, 0],
    end: [1, 1],
    colors: ['#222222', '#010102'],
    theme: 'light',
  },
];

const typefaceButtonSize = 36;
const TypefaceButton = ({ onPress, title }) => {
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
};

const TypeScreen = ({ gradient, gradientTheme, onPressTypefaceButton, typeface }) => {
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
};

class CameraScreen extends React.Component {
  static defaultProps = {
    headerLeftIconName: 'settings',
    headerLeft: props => <IconButton {...props} />,
  };

  render() {
    const { headerLeft, headerLeftIconName = 'settings' } = this.props;

    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Camera style={{ flex: 1 }} />
        <Header>
          {headerLeft({ name: headerLeftIconName })}
          <IconButton name={'chevron-right'} />
        </Header>
      </View>
    );
  }
}
const MusicScreen = () => {
  return (
    <BlurView
      tint={'dark'}
      intensity={100}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SearchBar
          round
          containerStyle={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}
          inputStyle={{ color: 'white', outlineWidth: 0, outlineStyle: 'none' }}
          placeholder="Search music"
        />
        <MusicNav />
      </SafeAreaView>
    </BlurView>
  );
};

const listItemImageSize = 56;
const ListScreenItem = ({ renderImage, title, subtitle, renderAction, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
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
  </TouchableOpacity>
);

const SongListScreenItem = ({ title, artist, image, onPress }) => (
  <ListScreenItem
    onPress={onPress}
    renderImage={({ style }) => <Image style={style} resizeMode="cover" source={image} />}
    title={title}
    subtitle={artist}
    renderAction={() => <PlayButtonIcon />}
  />
);
const USE_REMOTE_IMAGES = false;

const GenreListScreenItem = ({ genre, image, onPress }) => (
  <ListScreenItem
    onPress={onPress}
    renderImage={({ style }) => (
      <View style={StyleSheet.flatten([style, { padding: 12 }])}>
        <Image style={{ flex: 1, tintColor: 'white' }} resizeMode={'contain'} source={image} />
      </View>
    )}
    title={genre}
    renderAction={() => <ChevronRight />}
  />
);

const ListScreen = ({ onPress, ...props }) => (
  <FlatList
    keyExtractor={(o, i) => i + '--'}
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingBottom: 60 }}
    {...props}
    renderItem={({ item }) => {
      if (item.genre) {
        return (
          <GenreListScreenItem
            onPress={() => {
              props.navigation.push('MusicScreen', { item });
            }}
            {...item}
          />
        );
      }
      return <SongListScreenItem onPress={onPress} {...item} />;
    }}
  />
);

const createGenreScreen = data => props => <ListScreen {...props} data={data} />;

const transformCategorySet = categories => {
  return Object.keys(categories).map(itemKey => {
    return {
      genre: itemKey,
      image: {
        uri: 'https://png.pngtree.com/svg/20170526/mic_icon_525549.png',
      },
      items: transformSongList(categories[itemKey].results),
    };
  });
};

const moods = transformCategorySet(Moods);
const genres = transformCategorySet(Genres);

function transformSongList(list) {
  return list
    .filter(({ trackName }) => trackName)
    .map(song => {
      return {
        title: song.trackName,
        artist: song.artistName,
        isExplict: song.trackExplicitness === 'explicit',
        duration: song.trackTimeMillis,
        audio: song.previewUrl,
        image: {
          uri: USE_REMOTE_IMAGES
            ? song.artworkUrl60
            : 'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2018%2F09%2Flil-yachty-mtv-how-high-2-movie-0.jpg?q=75&w=800&cbr=1&fit=max',
        },
      };
    });
}
const Songs = transformSongList(Popular);

const GenreScreen = createGenreScreen(genres);
const MoodScreen = createGenreScreen(moods);

const PopularScreen = props => <ListScreen {...props} data={Songs.splice(0, 50)} />;
const aSong = {
  title: 'Wow.',
  artist: 'Post Malone',
  isExplict: true,
  image: { uri: 'https://pbs.twimg.com/profile_images/991091895014187008/H0os_Ljz_400x400.jpg' },
};

const MusicTabNavigator = createMaterialTopTabNavigator(
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
);

MusicTabNavigator.navigationOptions = { header: null };
class SecondaryMusicScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const item = navigation.getParam('item') || {};
    return {
      title: item.genre || item.name || 'MUSIC',
    };
  };
  render() {
    const { props } = this;
    const item = props.navigation.getParam('item') || {};

    return <ListScreen {...props} data={item.items.splice(0, 5)} />;
  }
}

const PlayButtonIcon = props => (
  <EvilIcons name="play" color={'rgba(255,255,255,0.7)'} size={36} {...props} />
);
const ChevronRight = props => (
  <EvilIcons name="chevron-right" color={'rgba(255,255,255,0.7)'} size={36} {...props} />
);

const musicBackgroundColor = 'rgba(0,0,0,0.0)';
const MusicNav = createAppContainer(
  createStackNavigator(
    {
      GenreScreen: MusicTabNavigator,
      MusicScreen: SecondaryMusicScreen,
    },
    {
      transparentCard: true,
      mode: 'card',
      headerMode: 'float',
      headerLayoutPreset: 'center',

      cardStyle: {
        backgroundColor: musicBackgroundColor,
      },
      headerTransitionPreset: 'uikit',
      defaultNavigationOptions: {
        headerStyle: {
          backgroundColor: musicBackgroundColor,
          borderBottomColor: 'white',
          borderBottomWidth: 1,
        },
        headerTintColor: 'white',
        headerBackImage: () => <EvilIcons name="chevron-left" color={'white'} size={56} />,
      },
    }
  )
);

export default class CameraContainerScreen extends React.Component {
  state = {
    ready: false,
    index: 0,
    selectedGradient: 0,
    selectedFont: 0,
  };

  async componentDidMount() {
    try {
      await Permissions.askAsync(Permissions.CAMERA);
      await Font.loadAsync({
        'insta-strong': Assets.fonts['insta-strong.otf'],
        'insta-neon': Assets.fonts['insta-neon.otf'],
        'insta-typewriter': Assets.fonts['insta-typewriter.ttf'],
        'insta-modern': Assets.fonts['insta-modern.ttf'],
      });
    } catch (error) {
    } finally {
      this.setState({ ready: true });
    }
  }

  onPressTypefaceButton = () => {
    this.setState({
      selectedFont: (this.state.selectedFont + 1) % types.length,
    });
  };

  render() {
    if (!this.state.ready) {
      return <View />;
    }
    LayoutAnimation.easeInEaseOut();
    const page = pages[this.state.index];
    const typeface = types[this.state.selectedFont];
    const { theme: gradientTheme, ...gradient } = gradients[this.state.selectedGradient];
    return (
      <View style={{ flex: 1, backgroundColor: 'green', justifyContent: 'flex-end' }}>
        <CameraScreen headerLeftIconName={page.headerLeftIconName} />

        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {page.screen &&
            page.screen({
              typeface,
              onPressTypefaceButton: this.onPressTypefaceButton,
              gradient,
              gradientTheme,
            })}
        </View>

        <MainFooter
          page={page}
          index={this.state.index}
          gradient={gradient}
          onPressGradientButton={() => {
            this.setState({
              selectedGradient: (this.state.selectedGradient + 1) % gradients.length,
            });
          }}
        />
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
          {Platform.OS === 'web' && (
            <View
              style={{
                width: 15,
                height: 15,
                borderTopLeftRadius: 2,
                backgroundColor: 'white',
                transform: [{ rotate: '45deg' }, { translateX: '50%' }, { translateY: '50%' }],
              }}
            />
          )}
        </View>
      </View>
    );
  }
}

const userProfilePictureSize = 24;
const userProfilePictureIndicatorSize = userProfilePictureSize * 0.3;
const UserProfilePicture = ({ source }) => (
  <View style={{ width: userProfilePictureSize, height: userProfilePictureSize, marginLeft: 4 }}>
    <Image style={{ flex: 1, borderRadius: userProfilePictureSize / 2 }} source={source} />
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'black',
        width: userProfilePictureIndicatorSize,
        height: userProfilePictureIndicatorSize,
        borderRadius: userProfilePictureIndicatorSize / 2,
        backgroundColor: 'lime',
      }}
    />
  </View>
);
const WhosActive = ({ users }) => (
  <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between' }}>
    <Text style={{ fontSize: 10, color: 'white' }}>
      {users
        .slice(0, 2)
        .map(({ name }) => name)
        .join(', ') + `, and ${users.length - 2} others are active now`}
    </Text>

    <View style={{ flexDirection: 'row' }}>
      {users.slice(0, 3).map((user, index) => (
        <UserProfilePicture key={index + '-img'} source={user.image} />
      ))}
    </View>
  </View>
);

const GoLiveButton = () => (
  <TouchableOpacity style={{ width: '50%' }}>
    <View
      style={{
        height: innerCaptureButtonHeight,
        borderRadius: innerCaptureButtonHeight / 2,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{ fontSize: 16 }}>Go Live</Text>
    </View>
  </TouchableOpacity>
);

const gradientButtonSize = 24;
const GradientButton = ({ gradient, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        borderWidth: 2,
        borderRadius: gradientButtonSize + 4,
        borderColor: 'white',
        padding: 2,
        backgroundColor: 'transparent',
      }}>
      <LinearGradient
        {...gradient}
        style={{
          width: gradientButtonSize,
          height: gradientButtonSize,
          borderRadius: gradientButtonSize / 2,
        }}
      />
    </View>
  </TouchableOpacity>
);

const users = [
  {
    name: 'Brent Vatne',
    image: {
      uri: 'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
    },
  },
  {
    name: 'Charlie Cheever',
    image: {
      uri: 'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
    },
  },
  {
    name: 'james',
    image: {
      uri: 'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
    },
  },
  {
    name: 'evan',
    image: {
      uri: 'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
    },
  },
];

class MainFooter extends React.Component {
  render() {
    const { page, gradient, index, onPressGradientButton } = this.props;

    const footerStyle = {
      display: page.hideFooter ? 'none' : 'flex',
      paddingHorizontal: 36,
      paddingVertical: 24,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
    };

    switch (page.id) {
      case 'type':
        return (
          <View style={footerStyle}>
            <GradientButton gradient={gradient} onPress={onPressGradientButton} />
            <CaptureButton selectedIndex={index} icon={page.icon} />
            <IconButton key="camera" name="camera-off" />
          </View>
        );
      case 'live':
        return (
          <View
            style={{
              ...footerStyle,

              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <WhosActive users={users} />

            <View
              style={{
                marginTop: 14,
                width: '100%',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <IconButton name="questions" />
              <GoLiveButton />
              <IconButton name="flip" />
              <IconButton name="face-off" />
            </View>
          </View>
        );
      default:
        return (
          <View style={footerStyle}>
            <GalleryButton
              source={{
                uri:
                  'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
              }}
            />
            <IconButton />
            <CaptureButton selectedIndex={index} icon={page.icon} />
            <IconButton name="flip" />
            <IconButton name="face-off" />
          </View>
        );
    }
  }
}

const captureButtonHidth = 72;
const innerCaptureButtonHeight = captureButtonHidth * 0.75;
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

const iconButtonSize = 30;

const IconButton = ({ onPress, name, size, color }) => (
  <TouchableOpacity style={{ width: iconButtonSize, height: iconButtonSize }} onPress={onPress}>
    <InstaIcon name={name} />
  </TouchableOpacity>
);
