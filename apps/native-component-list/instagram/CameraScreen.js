import EvilIcons from '@expo/vector-icons/EvilIcons';
import { BlurView } from 'expo-blur';
import { Camera } from 'expo-camera';
import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo';
import * as Permissions from 'expo-permissions';
import React from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createAppContainer,
  createMaterialTopTabNavigator,
  createStackNavigator,
  SafeAreaView,
} from 'react-navigation';
import { connect } from 'react-redux';

import Assets from './Assets';
import SearchBar from './components/SearchBar';
import Genres from './data/Genres.json';
import Moods from './data/Moods.json';
import Popular from './data/Popular-itunes.json';
import InstaIcon from './InstaIcon';
import NavigationService from './navigation/NavigationService';
import dispatch from './rematch/dispatch';
import Slider from './Slider';
import ViewPager from './ViewPager';

import MediaLibraryData from './constants/MediaLibraryData';
import ProfileImage from './components/ProfileImage';

// import Popular from './data/Popular.json';
const { height } = Dimensions.get('window');

const pages = [
  // {
  //   name: 'Type',
  //   icon: null,
  //   id: 'type',
  //   isFlipable: true,
  //   screen: props => <TypeScreen {...props} />,
  //   headerLeftIconName: null,
  // },
  // {
  //   name: 'Music',
  //   id: 'music',
  //   isFilterable: true,
  //   hideFooter: true,
  //   icon: Assets['inf.png'],
  //   screen: () => <MusicScreen />,
  // },
  { name: 'Live', id: 'live', isFilterable: true, icon: null },
  { name: 'Normal', id: 'normal', isFilterable: true, icon: null },
  { name: 'Boomerang', id: 'boomerang', isFilterable: true, icon: Assets['inf.png'] },
  { name: 'Superzoom', id: 'superzoom', isFilterable: false, icon: Assets['rewind.png'] },
  { name: 'Focus', id: 'focus', isFilterable: false, icon: Assets['inf.png'] },
  { name: 'Rewind', id: 'rewind', isFilterable: true, icon: Assets['rewind.png'] },
  { name: 'Hands-Free', id: 'handsfree', isFilterable: true, icon: Assets['ball.png'] },
].map(value => {
  return {
    ...value,
    name: value.name.toUpperCase(),
  };
});

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

let takePictureGlobal;
class CameraScreen extends React.Component {
  static defaultProps = {
    headerLeftIconName: 'settings',
    headerLeft: props => (
      <IconButton
        enabled={!DISABLE_CAMERA_SETTINGS}
        {...props}
        onPress={() => NavigationService.navigate('CameraSettingsScreen')}
      />
    ),
  };

  componentDidMount() {
    takePictureGlobal = this.takePicture;
  }

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({
        onPictureSaved: photo => {
          dispatch().image.set(photo);
        },
      });
    }
  };

  render() {
    const { headerLeft, camera = {}, headerLeftIconName = 'settings' } = this.props;
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Camera ref={ref => (this.camera = ref)} style={{ flex: 1 }} {...camera} />
        <Header>
          {headerLeft({ name: headerLeftIconName })}
          <IconButton
            name={'chevron-right'}
            onPress={() => {
              NavigationService.navigate('SocialUI');
            }}
          />
        </Header>
      </View>
    );
  }
}

const ConnectedCameraScreen = connect(({ camera }) => ({ camera }))(CameraScreen);

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

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

class EditorComboScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <MediaContainerScreen />
        {this.props.image && <EditorScreen image={this.props.image} />}
      </View>
    );
  }
}

const ConnectedEditorComboScreen = connect(({ image }) => ({ image }))(EditorComboScreen);

export default ConnectedEditorComboScreen;

class EditorScreen extends React.Component {
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

const DISABLE_BOTTOM_DRAWER = false;
const DISABLE_CAMERA_SETTINGS = true;

class MediaContainerScreen extends React.Component {
  animation = new Animated.Value(0);

  constructor(props) {
    super(props);
    this.onScroll = Animated.event(
      [
        {
          nativeEvent: { contentOffset: { y: this.animation } },
        },
      ],
      {
        useNativeDriver: true,
      }
    );
  }

  openMediaDrawer = () => {
    if (DISABLE_BOTTOM_DRAWER || !this.scrollView) {
      return;
    }
    this.scrollView._component.scrollToEnd({ duration: 300, animated: true });
  };
  openCamera = () => {
    console.log('open camera');
    if (DISABLE_BOTTOM_DRAWER || !this.scrollView) {
      return;
    }
    this.scrollView._component.scrollTo({ x: 0, y: 0, duration: 300 });
  };

  render() {
    const { height } = Dimensions.get('window');
    const drawerHeight = height * 0.9;

    if (DISABLE_BOTTOM_DRAWER) {
      return <CameraContainerScreen />;
    }
    return (
      <AnimatedScrollView
        ref={ref => (this.scrollView = ref)}
        scrollEventThrottle={16}
        onScroll={this.onScroll}
        pagingEnabled
        style={{ flex: 1 }}
        contentContainerStyle={{ height: height + drawerHeight }}>
        <BlurredOptionsContainer animation={this.animation} onPress={this.openCamera}>
          <CameraContainerScreen openMediaDrawer={this.openMediaDrawer} />
        </BlurredOptionsContainer>
        <MediaScreen
          style={{
            width: '100%',
            backgroundColor: 'black',
            height: drawerHeight,
          }}
        />
      </AnimatedScrollView>
    );
  }
}

class BlurredOptionsContainer extends React.Component {
  render() {
    const opacity = this.props.animation.interpolate({
      inputRange: [0, Dimensions.get('window').height],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={{ flex: 1 }}>
        {this.props.children}
        <Animated.View
          style={{ ...StyleSheet.absoluteFillObject, opacity }}
          pointerEvents={this.props.isEnabled ? 'auto' : 'none'}>
          <TouchableWithoutFeedback style={StyleSheet.absoluteFill} onPress={this.props.onPress}>
            <BlurView
              tint={'dark'}
              intensity={100}
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'stretch',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  padding: 8,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  LAST 24 HOURS
                </Text>

                <IconButton name={'camera'} />
              </View>
            </BlurView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    );
  }
}

class MediaScreen extends React.Component {
  render() {
    const { height } = Dimensions.get('window');

    return (
      <View style={this.props.style}>
        <FlatList
          keyExtractor={(item, index) => index + '--'}
          renderItem={({ item }) => <MediaItem {...item} />}
          contentContainerStyle={{ padding: 1 }}
          style={{ flex: 1 }}
          data={MediaLibraryData}
          numColumns={3}
        />
      </View>
    );
  }
}

class MediaItem extends React.Component {
  onPress = () => {
    console.log('set image', this.props.image);
    dispatch().image.set(this.props.image);
  };
  render() {
    const { height, width: screenWidth } = Dimensions.get('window');
    const width = screenWidth - 8;
    const aspectRatio = height / width;
    const itemWidth = width / 3;
    const itemHeight = itemWidth * aspectRatio;
    return (
      <TouchableOpacity
        style={{ margin: 1, width: itemWidth, height: itemHeight, backgroundColor: 'black' }}
        onPress={this.onPress}>
        <Image style={{ flex: 1, resizeMode: 'cover' }} source={this.props.image} />
      </TouchableOpacity>
    );
  }
}

class CameraContainerScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      index: 0,
      height: Dimensions.get('window').height,
      selectedGradient: 0,
      selectedFont: 0,
    };
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.onResize);
  }

  onResize = ({ window: { height } }) => {
    this.setState({ height });
  };

  async componentDidMount() {
    Dimensions.addEventListener('change', this.onResize);

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
      <View
        style={{
          flex: 1,
          height: this.state.height,
          backgroundColor: 'black',
          justifyContent: 'flex-end',
        }}>
        <ConnectedCameraScreen headerLeftIconName={page.headerLeftIconName} />

        {false && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {page.screen &&
              page.screen({
                typeface,
                onPressTypefaceButton: this.onPressTypefaceButton,
                gradient,
                gradientTheme,
              })}
          </View>
        )}
        <MainFooter
          page={page}
          index={this.state.index}
          gradient={gradient}
          openMediaDrawer={this.props.openMediaDrawer}
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
class UserProfilePicture extends React.Component {
  render() {
    const { account } = this.props;

    return (
      <View
        style={{ width: userProfilePictureSize, height: userProfilePictureSize, marginLeft: 4 }}>
        <ProfileImage
          style={{ flex: 1, borderRadius: userProfilePictureSize / 2 }}
          account={account}
        />
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
  }
}

class WhosActive extends React.Component {
  render() {
    const { users } = this.props;

    return (
      <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 10, color: 'white' }}>
          {users
            .slice(0, 2)
            .map(({ name }) => name)
            .join(', ') + `, and ${users.length - 2} others are active now`}
        </Text>

        <View style={{ flexDirection: 'row' }}>
          {users.slice(0, 3).map((user, index) => (
            <UserProfilePicture
              key={index + '-img'}
              account={user.account}
            />
          ))}
        </View>
      </View>
    );
  }
}

class GoLiveButton extends React.Component {
  render() {
    const { animation, isActive } = this.props;

    const opacity = animation.interpolate({
      inputRange: [0, 0.5],
      outputRange: [0, 1],
    });

    return (
      <Animated.View pointerEvents={isActive ? 'auto' : 'none'} style={{ width: '100%', opacity }}>
        <TouchableOpacity style={{ flex: 1 }}>
          <View
            style={{
              height: innerCaptureButtonHeight,
              borderRadius: innerCaptureButtonHeight / 2,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text lineBreakMode="clip" numberOfLines={1} style={{ fontSize: 16 }}>
              Go Live
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

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
    account: 'notbrent',
  },
  {
    name: 'Charlie Cheever',
    account: 'ccheever',
  },
  {
    name: 'James Ide',
    account: 'jameside',
  },
  {
    name: 'quin',
    image: {
      uri: 'quinlanjung',
    },
  },
];

class MainFooter extends React.Component {
  constructor(props) {
    super(props);

    this.liveAnimation = new Animated.Value(this.getAnimatedValue(props));
  }

  getAnimatedValue = ({ page }) => (page.id === 'live' ? 1 : 0);

  componentWillReceiveProps(nextProps, prevState, snapshot) {
    if (nextProps.page.id !== this.props.page.id) {
      Animated.timing(this.liveAnimation, {
        toValue: this.getAnimatedValue(nextProps),
        duration: 300,
      }).start();
    }
  }

  render() {
    const { page, gradient, index, onPressGradientButton } = this.props;

    const footerStyle = {
      display: page.hideFooter ? 'none' : 'flex',
      paddingHorizontal: 0,
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
            <IconButton enabled={false} key="camera" name={'camera'} />
          </View>
        );
      default: {
        const liveOpacity = this.liveAnimation.interpolate({
          inputRange: [0.2, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });
        const liveTranslationY = this.liveAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['-100%', '0%'],
        });

        return (
          <View
            style={{
              ...footerStyle,

              flexDirection: 'column',
              // alignItems: 'stretch',
              alignItems: 'center',
            }}>
            <Animated.View
              style={{
                opacity: liveOpacity,
                transform: [{ translateY: liveTranslationY }],
                marginBottom: 14,
                width: '80%',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <WhosActive users={users} />
            </Animated.View>
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <FlashButtonContainer openMediaDrawer={this.props.openMediaDrawer} {...page} />
              <CaptureButtonContainer
                onCapture={() => takePictureGlobal()}
                selectedIndex={index}
                animation={this.liveAnimation}
                icon={page.icon}
                isActive={page.id === 'live'}
              />

              <FlipButtonContainer liveAnimation={this.liveAnimation} {...page} />
            </View>
          </View>
        );
      }
    }
  }
}

class CaptureButtonContainer extends React.Component {
  render() {
    const { isActive, selectedIndex, animation, icon, onCapture } = this.props;

    const opacity = animation.interpolate({
      inputRange: [0.2, 1],
      outputRange: [1, 0],
    });

    const width = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['10%', '50%'],
    });
    return (
      <Animated.View
        style={{
          width,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Animated.View
          pointerEvents={isActive ? 'none' : 'auto'}
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CaptureButton onPress={onCapture} selectedIndex={selectedIndex} icon={icon} />
        </Animated.View>
        <GoLiveButton
          animation={animation}
          isActive={isActive}
          pointerEvents={!isActive ? 'none' : 'auto'}
        />
      </Animated.View>
    );
  }
}

class FlashButtonContainer extends React.Component {
  constructor(props) {
    super(props);

    this.animation = new Animated.Value(this.getAnimatedValue(props));
  }

  getAnimatedValue = ({ id }) => (id === 'live' ? 1 : 0);

  componentWillReceiveProps(nextProps, prevState, snapshot) {
    if (nextProps.id !== this.props.id) {
      Animated.timing(this.animation, {
        toValue: this.getAnimatedValue(nextProps),
        duration: 300,
      }).start();
    }
  }

  render() {
    const isLive = this.props.id === 'live';
    const moveFlip = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['75%', '0%'],
    });

    const fadeFace = this.animation.interpolate({
      inputRange: [0, 0.8],
      outputRange: [1, 0],
    });

    return (
      <View
        style={{
          flex: 1,
          height: '100%',
          // alignItems: 'center',
        }}>
        <View
          style={{
            flex: 1,
            marginLeft: Dimensions.get('window').width * 0.1,
            width: '50%',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Animated.View
            style={{ position: 'absolute', left: 0, opacity: fadeFace }}
            pointerEvents={isLive ? 'none' : 'auto'}>
            <GalleryButton
              onPress={this.props.openMediaDrawer}
              source={{
                uri:
                  'https://pbs.twimg.com/profile_images/1052466125055746048/kMLDBsaD_400x400.jpg',
              }}
            />
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              // right: 0,
              left: moveFlip,
              // opacity: fadeFace,
              // transform: [{ rotate: rotateFace }],
            }}>
            {!isLive && <FlashButton />}
            {isLive && <IconButton enabled={false} name="questions" />}
          </Animated.View>
        </View>
      </View>
    );
  }
}

const FlashNextState = {
  off: 'on',
  on: 'auto',
  auto: 'off',
};

class FlipCameraButton extends React.Component {
  state = {
    flashState: 'off',
  };
  animation = new Animated.Value(0);
  currentValue = 0;
  onPress = () => {
    this.currentValue -= 180;
    Animated.timing(this.animation, {
      toValue: this.currentValue,
      duration: 200,
    }).start();
    dispatch().camera.flip();
  };
  render() {
    const rotate = this.animation.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    });
    return (
      <Animated.View style={{ transform: [{ rotate }] }}>
        <IconButton {...this.props} onPress={this.onPress} name={`flip`} />
      </Animated.View>
    );
  }
}

class FlashButton extends React.Component {
  state = {
    flashState: 'off',
  };
  onPress = () => {
    this.setState({ flashState: FlashNextState[this.state.flashState] });
  };
  render() {
    return (
      <IconButton {...this.props} onPress={this.onPress} name={`flash-${this.state.flashState}`} />
    );
  }
}

class FaceButton extends React.Component {
  state = {
    isActive: false,
  };
  onPress = () => {
    this.setState({ isActive: !this.state.isActive });
  };
  render() {
    return (
      <IconButton
        {...this.props}
        onPress={this.onPress}
        active={this.state.isActive}
        name={`face`}
      />
    );
  }
}

class FlipButtonContainer extends React.Component {
  constructor(props) {
    super(props);
    this.animation = new Animated.Value(props.isFilterable ? 0 : 1);
  }

  componentWillReceiveProps(nextProps, prevState, snapshot) {
    if (nextProps.isFilterable !== this.props.isFilterable) {
      Animated.timing(this.animation, {
        toValue: nextProps.isFilterable ? 0 : 1,
        duration: 300,
      }).start();
    }
  }

  render() {
    const moveFlip = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '50%'],
    });

    const rotateFace = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-30deg'],
    });

    const fadeFace = this.animation.interpolate({
      inputRange: [0, 0.8],
      outputRange: [1, 0],
    });

    const liveWidth = this.props.liveAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['50%', '75%'],
    });
    // const liveOffset = this.props.liveAnimation.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: ['0%', '30%'],
    // });

    return (
      <View
        style={{
          flex: 1,
          height: '100%',
          alignItems: 'center',
        }}>
        <Animated.View
          style={{
            flex: 1,
            width: liveWidth,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}>
          <Animated.View style={{ position: 'absolute', left: moveFlip }}>
            <FlipCameraButton />
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              right: moveFlip,
              opacity: fadeFace,
              transform: [{ rotate: rotateFace }],
            }}>
            <FaceButton />
          </Animated.View>
        </Animated.View>
      </View>
    );
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
      <TouchableOpacity
        style={{ height: width, width }}
        pointerEvents="box-only"
        onPress={this.props.onPress}>
        <BlurView
          pointerEvents="none"
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

const GalleryButton = ({ onPress, source }) => {
  const size = 36;
  const enabled = !DISABLE_BOTTOM_DRAWER;
  return (
    <TouchableOpacity
      style={{ width: size, height: size }}
      pointerEvents={!enabled && 'none'}
      onPress={onPress}>
      <Image
        source={source}
        style={{
          opacity: enabled ? 1 : 0.5,
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
        this.viewPager.scrollToIndex({ index: this.props.index, duration: 1000 });
      }
    }
  }

  // get currentPage() {
  //   return this.pages[this.viewPager.index];
  // }

  // previous = () => {
  //   if (this.viewPager) {
  //     console.log(this.viewPager.index);
  //     this.viewPager.previous();
  //   }
  // };

  // next = () => {
  //   if (this.viewPager) {
  //     console.log(this.viewPager.index);
  //     this.viewPager.next();
  //   }
  // };

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
        useNativeDriver
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

const IconButton = ({
  style,
  containerStyle,
  enabled = true,
  onPress,
  active,
  name,
  size,
  color,
}) => (
  <TouchableOpacity
    pointerEvents={!enabled && 'none'}
    style={[containerStyle, { width: iconButtonSize, height: iconButtonSize }]}
    onPress={onPress}>
    <InstaIcon style={[style, { opacity: !enabled && 0.7 }]} active={active} name={name} />
  </TouchableOpacity>
);
