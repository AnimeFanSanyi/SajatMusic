import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { COLORS } from '../constants/theme';

export const getAppRootPath = () => {
  if (Platform.OS === 'windows') {
    return `${RNFS.DocumentDirectoryPath}\\SajatMusic\\Playlists`;
  }
  return `${RNFS.ExternalStorageDirectoryPath}/Music/SajatMusic/Playlists`;
};

export const BottomPathIndicator = () => {
  const currentPath = getAppRootPath();

  return (
    
      
        Storage Path: {currentPath}
      
    
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#050505',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#18181B',
    alignItems: 'center',
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontFamily: Platform.OS === 'windows' ? 'Consolas' : 'monospace',
  },
  path: {
    color: COLORS.accentPurpleLight,
  },
});