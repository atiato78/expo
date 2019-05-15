import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  NativeModules,
  NativeEventEmitter,
  requireNativeComponent,
  AppRegistry,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo';
import { ScanningView } from './scankit';

const SlotView = requireNativeComponent('AASlotView');

function Slot() {
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={{ padding: 15, alignItems: 'center', borderRadius: 5, flex: 1 }}>
      <Text>Hdsadsadasalo</Text>
    </LinearGradient>
  );
}

AppRegistry.registerComponent('slot', () => Slot);

export default class App extends React.Component {
  state = {
    height: 300,
    array: [],
  };

  componentDidMount() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.AAEventEmitter);
    this.eventEmitter.addListener('newStoreEvent', this.listener);
    // NativeModules.AAEventEmitter.dispatchEvent({ "text": "straight from sandbox"});
  }

  listener = result => console.warn('Received!', result);

  handleClick = () =>
    this.setState({
      height: this.state.height === 300 ? 100 : 300,
    });
  handleAdd = () => this.setState(({ array }) => ({ array: [...array, 0] }));

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <TouchableOpacity onPress={this.handleClick}>
          <Text>CLick!</Text>
        </TouchableOpacity>
        <ScanningView style={{ alignSelf: 'stretch', height: 300 }} isScanning onScannerDidRecognizeCode={({nativeEvent}) => console.warn(nativeEvent)} />
        <TouchableOpacity onPress={this.handleAdd}>
          <Text>Add a new bridge!</Text>
        </TouchableOpacity>
        <React.Fragment>
          {this.state.array.map((element, index) => (
            <SlotView
          style={{ backgroundColor: 'blue', alignSelf: 'stretch', height: 100 }}
          initialProperties={{}}
          experienceId="@newstore/adidas"
          moduleName="slot"
          key={index}
        />
          ))}
        </React.Fragment>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
