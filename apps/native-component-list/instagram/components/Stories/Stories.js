import React from 'react';
import { StyleSheet, View, PanResponder, Dimensions, Animated, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import Story from './Story';
import dispatch from '../../rematch/dispatch';
import { verticalSwipe, horizontalSwipe } from '../../rematch/stories';

const { width, height } = Dimensions.get('window');

const panResponder = PanResponder.create({
  onMoveShouldSetResponderCapture: () => true,
  onMoveShouldSetPanResponderCapture: (e, gesture) => {
    dispatch().stories.onMoveShouldSetPanResponderCapture({ e, gesture });
  },
  onPanResponderGrant: () => {
    dispatch().stories.onPanResponderGrant();
  },
  onPanResponderMove: (e, gesture) => {
    dispatch().stories.onPanResponderMove({ e, gesture });
  },
  onPanResponderRelease: (e, gesture) => {
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
          let scale = verticalSwipe.interpolate({
            inputRange: [-1, 0, height],
            outputRange: [1, 1, 0.75],
          });

          if (swipedHorizontally) {
            scale = horizontalSwipe.interpolate({
              inputRange: [width * (idx - 1), width * idx, width * (idx + 1)],
              outputRange: [0.79, 1, 0.78],
            });
          }

          return (
            <Animated.View
              key={idx}
              style={[
                styles.deck,
                {
                  transform: [
                    {
                      translateX: horizontalSwipe.interpolate({
                        inputRange: [width * (idx - 1), width * idx, width * (idx + 1)],
                        outputRange: [width, 0, -width],
                      }),
                    },
                    {
                      translateY: verticalSwipe.interpolate({
                        inputRange: [-1, 0, height],
                        outputRange: [0, 0, height / 2],
                      }),
                    },
                    { scale },
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
