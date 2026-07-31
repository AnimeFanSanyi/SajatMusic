import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { isTrackNew, sortTracks } from '../utils/playlistHelpers';
import { safeFormatTitle } from '../utils/CharacterErrorHandler';

export const PlaylistView = ({ playlistTracks, onSelectTrack, currentTrackId }) => {
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
    const isNew = isTrackNew(item.dateAdded);
    const isCurrentlyPlaying = item.id === currentTrackId;

    return (
       onSelectTrack(item)}
      >
        
          {isNew && ★ }
          
            {safeFormatTitle(item.title)}
          
        
        
          {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : ''}
        
      
    );
  };

  return (
    
      
        Sort By:
         toggleSort('name')}
        >
          
            Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          
        

         toggleSort('dateAdded')}
        >
          
            Date Added {sortBy === 'dateAdded' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          
        
      

       item.id}
        renderItem={renderTrackItem}
      />
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 12 },
  sortHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sortLabel: { color: COLORS.mutedText, fontSize: 12 },
  sortButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: COLORS.iconBorder, backgroundColor: COLORS.background },
  activeSort: { backgroundColor: COLORS.accentPurple },
  sortButtonText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  trackRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#18181B' },
  playingRow: { backgroundColor: COLORS.highlightOverlay },
  leftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  starIcon: { color: COLORS.accentPurpleLight, fontSize: 14, fontWeight: 'bold' },
  trackTitle: { color: COLORS.text, fontSize: 14, flex: 1 },
  playingText: { color: COLORS.accentPurpleLight, fontWeight: 'bold' },
  dateText: { color: COLORS.mutedText, fontSize: 11, marginLeft: 10 },
});