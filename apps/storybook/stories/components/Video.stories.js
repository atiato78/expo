import React from 'react';

import UIExplorer, { AppText, Description, Section } from '../ui-explorer';
import { storiesOf } from '../utils/storybook';
import { Video } from 'expo';
import { View } from 'react-native';

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

import notes from './Video.notes.md';

storiesOf('Components', module).add(TITLE, () => <DemoScreen />, { notes });
