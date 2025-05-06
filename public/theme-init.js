// Apply theme settings from localStorage before the app renders
(function() {
  try {
    // Get theme mode from localStorage or use default
    const savedMode = localStorage.getItem('themeMode') || 'light';
    document.documentElement.setAttribute('data-theme', savedMode);
    
    // Get color palette from localStorage or use default
    const savedPalette = localStorage.getItem('colorPalette') || 'blue';
    document.documentElement.setAttribute('data-color', savedPalette);
    
    console.log('Theme initialized from localStorage:', { mode: savedMode, palette: savedPalette });
  } catch (error) {
    console.error('Failed to initialize theme from localStorage:', error);
    // Apply defaults if there's an error
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-color', 'blue');
  }
})();
