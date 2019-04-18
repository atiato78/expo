/* @flow */
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import Colors from '../constants/Colors';

export default function renderIcon(
  IconComponent: any,
  iconName: string,
  iconSize: number,
  isSelected: boolean
) {
  let color = isSelected ? Colors.tabIconSelected : Colors.tabIconDefault;

  return <IconComponent name={iconName} size={iconSize} color={color} style={styles.icon} />;
}

const styles = StyleSheet.create({
  icon: {
    marginBottom: Platform.OS === 'android' ? 0 : -3,
  },
});
