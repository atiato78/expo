import React from 'react';
import { Audio } from 'expo';
import { PixelRatio, View, Text, Switch } from 'react-native';

import Button from '../../components/Button';
import ListButton from '../../components/ListButton';

export default class AudioModeSelector extends React.Component {
  state = {
    modeToSet: {
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
    },
    setMode: {
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
    },
  };

  _applyMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        ...this.state.modeToSet,
        // Android values don't matter, this is iOS-only selector
        shouldDuckAndroid: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
      this.setState({ setMode: this.state.modeToSet });
    } catch (error) {
      alert(error.message);
    }
  };

  _modesEqual = (modeA, modeB) =>
    modeA.interruptionModeIOS === modeB.interruptionModeIOS &&
    modeA.playsInSilentModeIOS === modeB.playsInSilentModeIOS &&
    modeA.allowsRecordingIOS === modeB.allowsRecordingIOS;

  _setMode = interruptionModeIOS => () =>
    this.setState({ modeToSet: { ...this.state.modeToSet, interruptionModeIOS } });

  _renderToggle = ({ title, disabled, valueName, value }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1.0 / PixelRatio.get(),
        borderBottomColor: '#cccccc',
      }}>
      <Text style={{ flex: 1, fontSize: 16 }}>{title}</Text>
      <Switch
        disabled={disabled}
        value={value !== undefined ? value : this.state.modeToSet[valueName]}
        onValueChange={() =>
          this.setState({
            modeToSet: { ...this.state.modeToSet, [valueName]: !this.state.modeToSet[valueName] },
          })
        }
      />
    </View>
  );

  _renderModeSelector = ({ title, disabled, value }) => (
    <ListButton
      disabled={disabled}
      title={`${this.state.modeToSet.interruptionModeIOS === value ? '✓ ' : ''}${title}`}
      onPress={this._setMode(value)}
    />
  );

  render() {
    return (
      <View style={{ marginTop: 5 }}>
        {this._renderToggle({
          title: 'Plays in silent mode',
          valueName: 'playsInSilentModeIOS',
        })}
        {this._renderToggle({
          title: 'Allows recording',
          valueName: 'allowsRecordingIOS',
          disabled: !this.state.modeToSet.playsInSilentModeIOS,
          value: !this.state.modeToSet.playsInSilentModeIOS ? false : undefined,
        })}
        {this._renderModeSelector({
          title: 'Mix with others',
          value: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        })}
        {this._renderModeSelector({
          title: 'Do not mix',
          value: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        })}
        {this._renderModeSelector({
          disabled: this.state.modeToSet.playsInSilentModeIOS === false,
          title: 'Duck others',
          value: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        })}
        <Button
          title="Apply changes"
          onPress={this._applyMode}
          style={{ marginTop: 10 }}
          disabled={this._modesEqual(this.state.modeToSet, this.state.setMode)}
        />
      </View>
    );
  }
}