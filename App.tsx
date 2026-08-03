import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';

interface Track {
  id: string;
  title: string;
  playlistName: string;
}

export default function App(): JSX.Element {
  // Demo Tracks (Ready for local playlist integration)
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: 'Song One.mp3', playlistName: 'Favorites' },
    { id: '2', title: 'Song Two.flac', playlistName: 'Rock' },
    { id: '3', title: 'Song Three.wav', playlistName: 'Favorites' },
  ]);

  const [queue, setQueue] = useState<Track[]>(tracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  // Search & Modal States
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [queueSearchQuery, setQueueSearchQuery] = useState('');
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);

  // Queue Shuffle
  const shuffleQueue = () => {
    const shuffled = [...queue];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQueue(shuffled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* HEADER & GLOBAL SEARCH */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>SajatMusic</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Global Search..."
            placeholderTextColor="#666"
            value={globalSearchQuery}
            onChangeText={setGlobalSearchQuery}
            onSubmitEditing={() => setIsGlobalSearchActive(true)}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsGlobalSearchActive(true)}
          >
            <Text style={styles.iconButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QUEUE CONTROLS */}
      <View style={styles.subControlBar}>
        <TextInput
          style={styles.subSearchInput}
          placeholder="Queue Search..."
          placeholderTextColor="#555"
          value={queueSearchQuery}
          onChangeText={setQueueSearchQuery}
        />
        <TouchableOpacity style={styles.textButton} onPress={shuffleQueue}>
          <Text style={styles.textButtonText}>Shuffle Queue</Text>
        </TouchableOpacity>
      </View>

      {/* QUEUE TRACK LIST */}
      <View style={styles.listArea}>
        <FlatList
          data={queue.filter((t) =>
            t.title.toLowerCase().includes(queueSearchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isCurrent = currentTrack?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.trackRow, isCurrent && styles.activePlayingRow]}
                onPress={() => setCurrentTrack(item)}
              >
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.playlistTag}>{item.playlistName}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* GLOBAL SEARCH MODAL */}
      <Modal
        visible={isGlobalSearchActive}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsGlobalSearchActive(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeXButton}
              onPress={() => setIsGlobalSearchActive(false)}
            >
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Search Results</Text>
            <FlatList
              data={tracks.filter((t) =>
                t.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.modalTrackRow}>
                  <Text style={styles.trackTitle}>{item.title}</Text>
                  <Text style={styles.playlistSubtext}>Playlist: {item.playlistName}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* FOOTER */}
      <View style={styles.pathFooter}>
        <Text style={styles.pathFooterText}>
          {currentTrack ? `Now Selected: ${currentTrack.title}` : 'SajatMusic Ready'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  iconButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 6,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    color: '#6b21a8',
    fontSize: 16,
  },
  subControlBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  subSearchInput: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    color: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#222222',
    paddingHorizontal: 10,
  },
  textButton: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  textButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 12,
  },
  trackRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePlayingRow: {
    borderLeftWidth: 4,
    borderLeftColor: '#6b21a8',
    backgroundColor: 'rgba(107, 33, 168, 0.15)',
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  playlistTag: {
    color: '#666666',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    height: '70%',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  closeXButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  closeXText: {
    color: '#6b21a8',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalTrackRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  playlistSubtext: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  pathFooter: {
    padding: 8,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
  pathFooterText: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
  },
});