import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import PlaylistView from './src/components/PlaylistView';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <PlaylistView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App;