import React from 'react';
import {
  StyleSheet,
  Platform,
  View,
  PanResponder,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import Story from './Story';
import dispatch from '../../rematch/dispatch';
import { verticalSwipe, horizontalSwipe } from '../../rematch/stories';

const { width, height } = Dimensions.get('window');
const halfWidth = width * 0.5;
const perspective = width;
const angle = Math.atan(perspective / halfWidth);
const ratio = 2; //Platform.OS === 'ios' ? 2 : 1.2;

const panResponder = PanResponder.create({
  onMoveShouldSetResponderCapture: () => true,
  onMoveShouldSetPanResponderCapture: (e, { dx, dy }) => {
    console.log('onMoveShouldSetPanResponderCapture');
    // dispatch().stories.onMoveShouldSetPanResponderCapture({ e, gesture });
    if (Math.abs(dx) > 5) {
      dispatch().stories.update({ swipedHorizontally: true });
      return true;
    }

    if (dy > 5) {
      dispatch().stories.update({ swipedHorizontally: false });
      return true;
    }

    return false;
  },
  onPanResponderGrant: () => {
    console.log('onPanResponderGrant');
    dispatch().stories.onPanResponderGrant();
  },
  onPanResponderMove: (e, gesture) => {
    console.log('onPanResponderMove');
    dispatch().stories.onPanResponderMove({ e, gesture });
  },
  onPanResponderRelease: (e, gesture) => {
    console.log('onPanResponderRelease');
    dispatch().stories.onPanResponderRelease({ e, gesture });
  },
});

class StoriesView extends React.Component {
  componentDidMount() {
    StatusBar.setHidden(true);
  }

  render() {
    const { deckIdx, stories = [], swipedHorizontally } = this.props;

    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        {stories.map((story, idx) => {
          //   let scale = verticalSwipe.interpolate({
          //     inputRange: [-1, 0, height],
          //     outputRange: [1, 1, 0.75],
          //   });

          //   if (swipedHorizontally) {
          //     scale = horizontalSwipe.interpolate({
          //       inputRange: [width * (idx - 1), width * idx, width * (idx + 1)],
          //       outputRange: [0.79, 1, 0.78],
          //     });
          //   }

          const offset = idx * width;
          const inputRange = [offset - width, offset + width];
          const translateX = horizontalSwipe.interpolate({
            inputRange,
            outputRange: [width / ratio, -width / ratio],
            extrapolate: 'clamp',
          });

          const rotateY = horizontalSwipe.interpolate({
            inputRange,
            outputRange: [`${angle}rad`, `-${angle}rad`],
            extrapolate: 'clamp',
          });
          const rotateYValue = rotateY.__getValue();

          const parsed = parseFloat(rotateYValue.substr(0, rotateYValue.indexOf('rad')), 10);
          const alpha = Math.abs(parsed);
          const gamma = angle - alpha;
          const beta = Math.PI - alpha - gamma;
          const w = halfWidth - (halfWidth * Math.sin(gamma)) / Math.sin(beta);
          const translateX2 = parsed > 0 ? w : -w;

          return (
            <Animated.View
              key={idx}
              style={[
                styles.deck,
                {
                  transform: [
                    { perspective },
                    { translateX },
                    { rotateY },
                    { translateX: translateX2 },

                    // {
                    //   translateX: horizontalSwipe.interpolate({
                    //     inputRange: [width * (idx - 1), width * idx, width * (idx + 1)],
                    //     outputRange: [width, 0, -width],
                    //   }),
                    // },
                    // {
                    //   translateY: verticalSwipe.interpolate({
                    //     inputRange: [-1, 0, height],
                    //     outputRange: [0, 0, height / 2],
                    //   }),
                    // },
                    // { scale },
                  ],
                },
              ]}>
              <Story story={story} currentDeck={deckIdx === idx} />
            </Animated.View>
          );
        })}
      </View>
    );
  }
}

export default connect(({ stories }) => ({ ...stories }))(StoriesView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  deck: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
  },
});
