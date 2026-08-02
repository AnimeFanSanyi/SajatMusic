import React, { useState, useEffect, useRef } from 'react';
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
import * as RNFS from 'react-native-fs';

declare const window: any;

interface Track {
  id: string;
  title: string;
  playlistName: string;
  path: string;
}

export default function App(): JSX.Element {
  // --- SAFE PATH GENERATOR ---
  const getRootPath = () => {
    try {
      if (Platform.OS === 'windows') {
        const docDir = RNFS.DocumentDirectoryPath || 'C:\\AppRootFolder\\Playlists';
        return `${docDir}\\AppRootFolder\\Playlists`;
      }
      return `${RNFS.ExternalStorageDirectoryPath || ''}/Music/AppRootFolder/Playlists`;
    } catch {
      return 'C:\\AppRootFolder\\Playlists';
    }
  };

  const rootPath = getRootPath();

  // --- STATES ---
  const [tracks, setTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Search & Modal States
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [queueSearchQuery, setQueueSearchQuery] = useState('');
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // --- AUTO-DIRECTORY SCANNER ---
  useEffect(() => {
    scanDirectory();
  }, []);

  const scanDirectory = async () => {
    try {
      if (!RNFS || !RNFS.exists) return;

      const exists = await RNFS.exists(rootPath);
      if (!exists) {
        await RNFS.mkdir(rootPath);
      }

      const playlistItems = await RNFS.readDir(rootPath);
      const playlistFolders = playlistItems.filter((item) => item.isDirectory());

      let loadedTracks: Track[] = [];

      for (const folder of playlistFolders) {
        const folderFiles = await RNFS.readDir(folder.path);
        const audioFiles = folderFiles.filter((file) =>
          /\.(mp3|m4a|mp4|flac|wav|ogg|aac)$/i.test(file.name)
        );

        const folderTracks: Track[] = audioFiles.map((file) => ({
          id: file.path,
          title: file.name,
          playlistName: folder.name,
          path: file.path,
        }));

        loadedTracks = [...loadedTracks, ...folderTracks];
      }

      setTracks(loadedTracks);
      setQueue(loadedTracks.slice(0, 10));
    } catch (err) {
      console.warn('Directory scan caught:', err);
    }
  };

  // --- SAFE CHARACTER FAULT HANDLER ---
  const safeRenderTitle = (rawTitle: string): string => {
    try {
      const decoded = decodeURIComponent(rawTitle);
      for (let i = 0; i < decoded.length; i++) {
        if (decoded.charCodeAt(i) === 0xfffd) {
          return `[Encoding Error @ Char #${i}]`;
        }
      }
      return decoded;
    } catch {
      return `[Encoding Error @ Char #0]`;
    }
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (Platform.OS === 'windows') {
      const handleKeyDown = (event: any) => {
        if (event.code === 'Space' && !isInputFocused) {
          event.preventDefault();
          setIsPlaying((prev) => !prev);
        }
        if (event.code === 'Escape') {
          setIsPlaylistModalOpen(false);
          setIsGlobalSearchActive(false);
        }
      };

      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }
    }
  }, [isInputFocused]);

  // --- QUEUE SHUFFLE ---
  const shuffleQueue = (trackList: Track[]) => {
    const shuffled = [...trackList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQueue(shuffled.slice(0, 10));
  };

  const handleQueueSearchSubmit = () => {
    if (!queueSearchQuery.trim()) return;
    const matchIndex = queue.findIndex((t) =>
      t.title.toLowerCase().includes(queueSearchQuery.toLowerCase())
    );
    if (matchIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: matchIndex, animated: true });
    }
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
            placeholder="Global Search (Enter to run)..."
            placeholderTextColor="#666"
            value={globalSearchQuery}
            onChangeText={setGlobalSearchQuery}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
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

      {/* QUEUE SEARCH & SHUFFLE */}
      <View style={styles.subControlBar}>
        <TextInput
          style={styles.subSearchInput}
          placeholder="Queue Search (Real-time highlight)..."
          placeholderTextColor="#555"
          value={queueSearchQuery}
          onChangeText={setQueueSearchQuery}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmitEditing={handleQueueSearchSubmit}
        />
        <TouchableOpacity style={styles.textButton} onPress={() => shuffleQueue(tracks)}>
          <Text style={styles.textButtonText}>Shuffle Queue</Text>
        </TouchableOpacity>
      </View>

      {/* QUEUE LIST */}
      <View style={styles.listArea}>
        {queue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tracks loaded yet.</Text>
            <Text style={styles.emptySubtext}>Add audio files to your Playlists subfolder.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={queue}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMatched =
                queueSearchQuery.length > 0 &&
                item.title.toLowerCase().includes(queueSearchQuery.toLowerCase());
              const isCurrent = currentTrack?.id === item.id;

              return (
                <TouchableOpacity
                  style={[
                    styles.trackRow,
                    isMatched && styles.searchHighlightRow,
                    isCurrent && styles.activePlayingRow,
                  ]}
                  onPress={() => setCurrentTrack(item)}
                >
                  <Text style={styles.trackTitle}>{safeRenderTitle(item.title)}</Text>
                  <Text style={styles.playlistTag}>{item.playlistName}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* SEARCH MODAL */}
      <Modal
        visible={isGlobalSearchActive || isPlaylistModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setIsGlobalSearchActive(false);
          setIsPlaylistModalOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeXButton}
              onPress={() => {
                setIsGlobalSearchActive(false);
                setIsPlaylistModalOpen(false);
              }}
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
                  <Text style={styles.trackTitle}>{safeRenderTitle(item.title)}</Text>
                  <Text style={styles.playlistSubtext}>Playlist: {item.playlistName}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* FOOTER */}
      <View style={styles.pathFooter}>
        <Text style={styles.pathFooterText} numberOfLines={1}>
          Storage Path: {rootPath}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#444444',
    fontSize: 12,
    marginTop: 4,
  },
  trackRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchHighlightRow: {
    backgroundColor: 'rgba(128, 0, 128, 0.25)',
  },
  activePlayingRow: {
    borderLeftWidth: 4,
    borderLeftColor: '#6b21a8',
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