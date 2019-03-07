import React from 'react';
import { FlatList, Dimensions, Text, View } from 'react-native';
import ViewPager from './ViewPager';

const pages = ['Type', 'Music', 'Live', 'Normal', 'Boomerang', 'Rewind', 'Hands-Free'].map(value =>
  value.toUpperCase()
);

const { width } = Dimensions.get('window');
const HORIZONTAL_ITEM_WIDTH = 95;
const HORIZONTAL_ITEM_END_SPACE = (width - HORIZONTAL_ITEM_WIDTH) / 2;

export default class Slider extends React.Component {
  state = { index: 0 };

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
    // const marginLeft = index === 0 ? HORIZONTAL_ITEM_END_SPACE : 0;
    // const marginRight = index === pages.length - 1 ? HORIZONTAL_ITEM_END_SPACE : 0;
    return (
      <Text
        style={{
          width,
          fontWeight: 'bold',
          //   marginLeft,
          //   marginRight,
          fontSize: 12,
          color: 'white',
          textAlign: 'center',
          backgroundColor: 'blue',
        }}
        key={item}>
        {item}
      </Text>
    );
  };
  render() {
    return (
      <View style={{ flex: 1, maxHeight: 60 }}>
        <ViewPager
          pagingEnabled
          onMomentumScrollEnd={() => {
            const { index } = this.viewPager;
            console.log('eng', this.state.index, index);
            if (this.state.index !== index) {
              this.props.onIndexChange(index, this.state.index);
              this.setState({ index });
            }
          }}
          onScroll={({ value }) => {
            console.log('scroll', value);
          }}
          ref={ref => (this.viewPager = ref)}
          data={this.props.data}
          renderItem={this.renderItem}
          style={{ flex: 1 }}
          size={width}
          horizontal
        />
      </View>
    );
  }
}
