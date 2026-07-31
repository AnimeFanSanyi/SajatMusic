export const safeFormatTitle = (filename) => {
  if (!filename) return 'Unknown Track';

  for (let i = 0; i < filename.length; i++) {
    const code = filename.charCodeAt(i);
    if (code === 0xFFFD || (code >= 0xD800 && code <= 0xDFFF)) {
      return `[Encoding Error @ Char #${i + 1}]`;
    }
  }

  return filename;
};