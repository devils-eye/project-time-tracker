import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define theme types
export type ThemeMode = 'light' | 'dark';
export type ColorPalette = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

interface ThemeContextType {
  mode: ThemeMode;
  palette: ColorPalette;
  toggleMode: () => void;
  setPalette: (palette: ColorPalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Initialize from localStorage or default values
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'light';
  });
  
  const [palette, setPaletteState] = useState<ColorPalette>(() => {
    const savedPalette = localStorage.getItem('colorPalette');
    return (savedPalette as ColorPalette) || 'blue';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('colorPalette', palette);
    document.documentElement.setAttribute('data-color', palette);
  }, [palette]);

  // Apply theme to document
  useEffect(() => {
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-color', palette);
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setPalette = (newPalette: ColorPalette) => {
    setPaletteState(newPalette);
  };

  return (
    <ThemeContext.Provider value={{ mode, palette, toggleMode, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
