import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { isTrackNew, sortTracks } from '../utils/playlistHelpers';
import { safeFormatTitle } from '../utils/CharacterErrorHandler';

export const PlaylistView = ({ playlistTracks = [], onSelectTrack = () => {}, currentTrackId = null }) => {
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');

  const displayedTracks = useMemo(() => {
    return sortTracks(playlistTracks, sortBy, sortOrder);
  }, [playlistTracks, sortBy, sortOrder]);

  const toggleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(type);
      setSortOrder(type === 'name' ? 'asc' : 'desc');
    }
  };

  const renderTrackItem = ({ item }) => {
    const isNew = isTrackNew(item?.dateAdded);
    const isCurrentlyPlaying = item?.id === currentTrackId;

    return (
      <TouchableOpacity
        style={[styles.trackRow, isCurrentlyPlaying && styles.playingRow]}
        onPress={() => onSelectTrack(item)}
      >
        <View style={styles.leftContainer}>
          {isNew && <Text style={styles.starIcon}>★ </Text>}
          <Text style={[styles.trackTitle, isCurrentlyPlaying && styles.playingText]}>
            {safeFormatTitle(item?.title || 'Unknown Track')}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {item?.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sortHeader}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.activeSort]}
          onPress={() => toggleSort('name')}
        >
          <Text style={styles.sortButtonText}>
            Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'dateAdded' && styles.activeSort]}
          onPress={() => toggleSort('dateAdded')}
        >
          <Text style={styles.sortButtonText}>
            Date Added {sortBy === 'dateAdded' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedTracks}
        keyExtractor={(item) => (item?.id ? String(item.id) : Math.random().toString())}
        renderItem={renderTrackItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background || '#121212', padding: 12 },
  sortHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sortLabel: { color: COLORS.mutedText || '#888888', fontSize: 12 },
  sortButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: COLORS.iconBorder || '#333', backgroundColor: COLORS.background || '#121212' },
  activeSort: { backgroundColor: COLORS.accentPurple || '#6200ee' },
  sortButtonText: { color: COLORS.text || '#FFFFFF', fontSize: 12, fontWeight: '600' },
  trackRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#18181B' },
  playingRow: { backgroundColor: COLORS.highlightOverlay || '#222222' },
  leftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  starIcon: { color: COLORS.accentPurpleLight || '#bb86fc', fontSize: 14, fontWeight: 'bold' },
  trackTitle: { color: COLORS.text || '#FFFFFF', fontSize: 14, flex: 1 },
  playingText: { color: COLORS.accentPurpleLight || '#bb86fc', fontWeight: 'bold' },
  dateText: { color: COLORS.mutedText || '#888888', fontSize: 11, marginLeft: 10 },
});

export default PlaylistView;