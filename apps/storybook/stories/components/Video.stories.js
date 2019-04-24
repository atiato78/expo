import { storiesOf } from '@storybook/react-native';
import { Video } from 'expo';
import React from 'react';
import { View } from 'react-native';

import UIExplorer, { Description } from '../ui-explorer';
import notes from './Video.notes.md';

const TITLE = 'Video';

class DemoScreen extends React.Component {
  render() {
    return (
      <UIExplorer title={TITLE}>
        <Description>A video</Description>
        <View>
          <Video
            source={{ uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping
            style={{ width: 300, height: 300 }}
          />
        </View>
      </UIExplorer>
    );
  }
}

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
