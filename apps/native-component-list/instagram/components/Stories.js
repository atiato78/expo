import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

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

const ICON_SIZE = 56;

const Story = ({ title, source, renderImage }) => (
  <View style={{ alignItems: 'center', marginRight: 12 }}>
    <OutlineImage source={source} renderImage={renderImage} imageSize={ICON_SIZE} />
    <Text style={{ fontSize: 16, marginTop: 6 }}>{title}</Text>
  </View>
);

const NewStory = () => {
  return (
    <Story
      title="new"
      renderImage={() => (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            marginTop: 4,
            alignItems: 'center',
          }}>
          <Ionicons name="ios-add" size={48} />
        </View>
      )}
    />
  );
};
const Stories = ({ stories, hasNew }) => (
  <ScrollView horizontal style={styles.row}>
    {hasNew && <NewStory />}
    {stories.map(story => (
      <Story {...story} />
    ))}
  </ScrollView>
);

export default Stories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
});
