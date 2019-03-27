import { WebBrowser } from 'expo';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import FeedList from '../components/FeedList';
import Posts from '../constants/Posts';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Instagram',
  };
  render() {
    // <FeedList style={styles.container} data={Posts} />
    return <FeedList style={styles.container} data={[]} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
