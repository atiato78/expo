import React from 'react';
import { Image, Dimensions, View } from 'react-native';

import { ItemFooter } from './ItemFooter';
import { ItemHeader } from './ItemHeader';

export class Item extends React.PureComponent {
  state = {
    width: undefined,
    height: undefined,
    isLoaded: false,
  };
  componentDidMount() {
    if (!this.props.imageWidth) {
      Image.getSize(this.props.source.uri, (width, height) => {
        this.setState({ width, height, isLoaded: true });
      });
    }
  }
  render() {
    const { imageWidth, imageHeight } = this.props;
    const fullWidth = Dimensions.get('window').width;
    const imgW = imageWidth || this.state.width || fullWidth;
    const imgH = imageHeight || this.state.height || imgW;
    const aspectRatio = imgH / imgW;
    const adjustedHeight = fullWidth * aspectRatio;
    return (
      <View>
        <ItemHeader name={this.props.author} source={this.props.source} />
        <Image
          style={{
            resizeMode: 'contain',
            // aspectRatio: aspect,
            height: adjustedHeight,
            width: '100%',
            opacity: this.state.isLoaded ? 1 : 0,
          }}
          source={this.props.source}
        />
        <ItemFooter
          name={this.props.author}
          description={this.props.description}
          comments={this.props.comments}
        />
      </View>
    );
  }
}
