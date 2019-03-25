import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import NavigationService from '../navigation/NavigationService';
import InstaIcon from '../InstaIcon';

import Square from '../components/Square';

import Stories from '../components/Stories';

const Stat = ({ title, children, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{children}</Text>
      <Text style={{ fontSize: 16, opacity: 0.8 }}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const StatsBar = ({ stats }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
    {stats.map(({ title, value, onPress }) => (
      <Stat key={title} title={title} onPress={onPress}>
        {value}
      </Stat>
    ))}
  </View>
);

class OutlineImage extends React.Component {
  render() {
    const { style, renderImage, imageSize, ...props } = this.props;

    const imagePadding = 4;
    const imageBorderWidth = 1;
    const imageWrapperSize = imageSize + (imagePadding + imageBorderWidth) * 2;

    let imageComponent;
    if (renderImage) {
      imageComponent = renderImage({ imageWrapperSize });
    } else {
      imageComponent = (
        <Image
          style={[
            {
              aspectRatio: 1,
              height: imageSize,
              width: imageSize,
              borderRadius: imageSize / 2,
              overflow: 'hidden',
              resizeMode: 'cover',
              backgroundColor: 'lightgray',
            },
            style,
          ]}
          {...props}
        />
      );
    }
    return (
      <View
        style={{
          aspectRatio: 1,
          height: imageWrapperSize,
          width: imageWrapperSize,
          padding: imagePadding,
          borderRadius: imageWrapperSize / 2,
          borderWidth: imageBorderWidth,
          borderColor: 'rgba(0,0,0,0.3)',
        }}>
        {imageComponent}
      </View>
    );
  }
}

const EditButton = () => (
  <TouchableHighlight>
    <View
      style={{
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
        marginHorizontal: 8,
        marginVertical: 8,
      }}>
      <Text style={{ fontSize: 16, fontWeight: '500' }}>Edit</Text>
    </View>
  </TouchableHighlight>
);

const ACCOUNT = 'baconbrix';
class ProfileHead extends React.Component {
  render() {
    const stats = [
      {
        title: 'posts',
        value: '4k',
        onPress: () => {
          //TODO: Bacon: Scroll down
        },
      },
      {
        title: 'following',
        value: '72k',
        onPress: () => NavigationService.navigate('Profile_Following', { users: [] }),
      },
      {
        title: 'followers',
        value: '-1M',
        onPress: () => NavigationService.navigate('Profile_Followers', { users: [] }),
      },
    ];

    return (
      <View style={styles.row}>
        <OutlineImage
          source={{
            uri: `https://avatars.io/instagram/${ACCOUNT}/Medium`,
          }}
          imageSize={96}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch' }}>
          <StatsBar stats={stats} />
          <EditButton />
        </View>
      </View>
    );
  }
}

const ProfileBody = () => (
  <View
    style={{
      paddingHorizontal: 12,
    }}>
    <Text style={{ fontSize: 16, marginBottom: 4, fontWeight: '500' }}>Evan Bacon</Text>
    <Text style={{ fontSize: 16 }}>
      Self-taught #JavaScript developer 🎨 #Lego Master Builder I do stuff with 💙 Expo,
      #ReactNative, firebase, arkit, and #3dmodeling 🏠 #Austin 🔥 Bay Area
    </Text>
    <Text
      style={{
        fontSize: 16,
        color: '#003569',
        marginBottom: 4,
        fontWeight: '500',
      }}
      onPress={() => Linking.openURL('https://www.github.com/evanbacon')}>
      github.com/evanbacon
    </Text>
  </View>
);

const FormatButton = ({ icon, onPress, selected }) => (
  <TouchableHighlight onPress={onPress} style={{ flex: 1 }}>
    <View
      style={{
        flex: 1,
        marginTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <InstaIcon size={32} color={selected ? '#003569' : 'rgba(0,0,0,0.5)'} name={icon} />
    </View>
  </TouchableHighlight>
);

const FormatRow = () => (
  <View
    style={[
      styles.row,
      {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.3)',
        height: 48,
      },
    ]}>
    <FormatButton icon="grid" selected />
    <FormatButton icon="list" />
    <FormatButton icon="tag-user" />
  </View>
);

const PhotoGridIcon = ({ name }) => (
  <InstaIcon style={{ marginHorizontal: 4 }} name={name} size={26} color={'gray'} />
);
class PhotoGridItem extends React.PureComponent {
  render() {
    const { hasMulti } = this.props;
    return (
      <Square
        style={{
          aspectRatio: 1,
          flex: 0.333,
          marginRight: 1,
        }}>
        <TouchableOpacity
          onPress={() => NavigationService.navigate('Profile_Details', { item: this.props })}
          activeOpacity={0.6}
          style={{ flex: 1 }}>
          <Image
            style={{
              resizeMode: 'cover',
              flex: 1,
            }}
            source={this.props.source}
          />
        </TouchableOpacity>

        {hasMulti && (
          <Ionicons
            style={{
              transform: [{ scaleX: -1 }],
              position: 'absolute',
              top: 8,
              right: 8,
            }}
            name={'md-copy'}
            size={26}
            color={'white'}
          />
        )}
      </Square>
    );
  }
}

class PhotoGrid extends React.Component {
  render() {
    const { onPressFooter, ...props } = this.props;
    return (
      <FlatList
        numColumns={3}
        columnWrapperStyle={{
          marginHorizontal: -1,
          marginBottom: 1,
          justifyContent: 'space-between',
        }}
        contentContainerStyle={{ marginBottom: 64 }}
        renderItem={({ item }) => <PhotoGridItem {...item} />}
        keyExtractor={item => item.key}
        {...props}
      />
    );
  }
}

const posts = [
  {
    description: 'Being a 21-year-old @expo.io developer is lit 😍🔥💙',
    image: `https://scontent-sjc3-1.cdninstagram.com/vp/0ea7ffb0370dddfadd528a8b1b516573/5D186640/t51.2885-15/e35/45460185_782185418780650_4154679091114957131_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com`,
  },
  {
    description: 'Being a 21-year-old @expo.io developer is lit 😍🔥💙',
    image: `https://scontent-sjc3-1.cdninstagram.com/vp/38bfcc8b1412fe6e9eacf269def89ba5/5D0F993A/t51.2885-15/sh0.08/e35/c0.78.1080.1080/s640x640/50824531_117448239345934_8589191116386787248_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com`,
  },
  {
    description: 'Being a 21-year-old @expo.io developer is lit 😍🔥💙',
    image: `https://scontent-sjc3-1.cdninstagram.com/vp/f939678f172bbb08daec6cfe8f6c0aa1/5D4F31EB/t51.2885-15/sh0.08/e35/s640x640/44588924_315715379251262_8214353241920829455_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com`,
  },
  {
    description: 'enjoying a hammysammy',
    hasMulti: true,
    image: 'https://i.ytimg.com/vi/iSTUfJjtEOY/maxresdefault.jpg',
  },
  {
    description: 'enjoying a hammysammy',

    image:
      'https://m.media-amazon.com/images/M/MV5BNTE0Yzc3OTQtN2NhMS00NTdiLTlmMzAtOGRjNmQ3ZGYxN2M5XkEyXkFqcGdeQXVyMzQ3OTE4NTk@._V1_UY268_CR11,0,182,268_AL_.jpg',
  },
  {
    description: 'enjoying a hammysammy',

    image: 'https://i.ebayimg.com/images/g/MuwAAOSwax5YoZOp/s-l300.jpg',
  },
  {
    description: 'enjoying a hammysammy',
    image:
      'https://coubsecure-s.akamaihd.net/get/b115/p/coub/simple/cw_timeline_pic/3ad828e8989/ffa93af652a155a7911d2/big_1473465663_1382481140_image.jpg',
  },
  {
    description: 'enjoying a hammysammy',
    image: 'https://regularshowwiki.weebly.com/uploads/7/4/1/1/7411048/8617815_orig.png',
  },
].map(item => ({ author: ACCOUNT, source: { uri: item.image }, ...item }));

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Baconbrix',
  };

  componentDidMount() {
    // setTimeout(() => {
    //   NavigationService.navigate('Profile_Details', { item: posts[0] });
    // });
  }
  render() {
    const stories = [
      {
        key: 'a',
        source: {
          uri:
            'https://scontent-sjc3-1.cdninstagram.com/vp/456a1e244da1dd8f8e66aee1c01acb92/5C9A9B70/t51.12442-15/e15/c0.280.720.720/s150x150/25012214_1298884170256839_2925294958220935168_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com',
        },
        title: 'Expo',
      },
      {
        key: 'b',
        source: {
          uri:
            'https://scontent-sjc3-1.cdninstagram.com/vp/7fdcefa9cbea31ff358b1d388e9ea326/5C9B5E36/t51.12442-15/e15/c426.433.576.576/s150x150/29739037_757557021118316_2970672945560551424_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com',
        },
        title: 'Hair',
      },
      {
        key: 'c',
        source: {
          uri:
            'https://scontent-sjc3-1.cdninstagram.com/vp/f7e0a9c7d16230c40e5030c8dff3881b/5C9A3B92/t51.12442-15/e35/c3.110.1001.1001/s150x150/38448292_1018033021710609_9216289335135961088_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com',
        },
        title: 'Kixx 👟',
      },
    ];

    return (
      <ScrollView style={styles.container}>
        <ProfileHead />
        <ProfileBody />
        <Stories stories={stories} hasNew />
        <FormatRow />
        <PhotoGrid data={posts} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
});
