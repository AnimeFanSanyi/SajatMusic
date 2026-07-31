export const isTrackNew = (dateAdded) => {
  if (!dateAdded) return false;
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
  return (Date.now() - new Date(dateAdded).getTime()) < ONE_DAY_IN_MS;
};

export const sortTracks = (tracks, sortBy = 'dateAdded', direction = 'desc') => {
  return [...tracks].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      comparison = titleA.localeCompare(titleB);
    } else if (sortBy === 'dateAdded') {
      const timeA = new Date(a.dateAdded || 0).getTime();
      const timeB = new Date(b.dateAdded || 0).getTime();
      comparison = timeA - timeB;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
};