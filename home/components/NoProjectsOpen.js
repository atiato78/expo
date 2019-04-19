/* @flow */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import Colors from '../constants/Colors';

export default class NoProjectsOpen extends React.Component {
  render() {
    const { isAuthenticated } = this.props;
    let message;
    if (isAuthenticated) {
      message = 'No projects are currently open.';
    } else {
      message =
        'Sign in to your Expo account to see the projects you have recently been working on.';
    }

    return <Text style={styles.text}>{message}</Text>;
  }
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignSelf: 'stretch',
    // styles.bottomBorder

    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
    // styles.text
    color: Colors.greyText,
    fontSize: 13,
  },
});
