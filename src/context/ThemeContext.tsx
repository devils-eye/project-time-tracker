import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { settingsApi } from "../services/api";

// Define theme types
export type ThemeMode = "light" | "dark";
export type ColorPalette = "blue" | "purple" | "green" | "orange" | "pink";

// Helper functions for theme management
export const getStoredThemeMode = (): ThemeMode => {
  try {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode as ThemeMode) || "light";
  } catch (error) {
    console.error("Error reading theme mode from localStorage:", error);
    return "light";
  }
};

export const getStoredColorPalette = (): ColorPalette => {
  try {
    const savedPalette = localStorage.getItem("colorPalette");
    return (savedPalette as ColorPalette) || "blue";
  } catch (error) {
    console.error("Error reading color palette from localStorage:", error);
    return "blue";
  }
};

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
  // Initialize from localStorage or default values using helper functions
  const [mode, setMode] = useState<ThemeMode>(getStoredThemeMode);
  const [palette, setPaletteState] = useState<ColorPalette>(
    getStoredColorPalette
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from server on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await settingsApi.getAll();

        // Apply theme mode from server
        if (settings.themeMode) {
          const serverMode = settings.themeMode as ThemeMode;
          setMode(serverMode);
          localStorage.setItem("themeMode", serverMode);
          document.documentElement.setAttribute("data-theme", serverMode);
        }

        // Apply color palette from server
        if (settings.colorPalette) {
          const serverPalette = settings.colorPalette as ColorPalette;
          setPaletteState(serverPalette);
          localStorage.setItem("colorPalette", serverPalette);
          document.documentElement.setAttribute("data-color", serverPalette);
        }

        console.log("Theme settings loaded from server");
      } catch (error) {
        console.error("Failed to load theme settings from server:", error);
        // Fall back to localStorage values (already set in state)
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update localStorage, DOM, and server when theme changes
  useEffect(() => {
    if (isLoading) return; // Skip during initial loading

    try {
      // Update localStorage and DOM
      localStorage.setItem("themeMode", mode);
      document.documentElement.setAttribute("data-theme", mode);

      // Update server (don't await to avoid blocking UI)
      settingsApi.update("themeMode", mode).catch((error) => {
        console.error("Failed to save theme mode to server:", error);
      });

      console.log("Theme mode updated:", mode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  }, [mode, isLoading]);

  useEffect(() => {
    if (isLoading) return; // Skip during initial loading

    try {
      // Update localStorage and DOM
      localStorage.setItem("colorPalette", palette);
      document.documentElement.setAttribute("data-color", palette);

      // Update server (don't await to avoid blocking UI)
      settingsApi.update("colorPalette", palette).catch((error) => {
        console.error("Failed to save color palette to server:", error);
      });

      console.log("Color palette updated:", palette);
    } catch (error) {
      console.error("Failed to save color palette:", error);
    }
  }, [palette, isLoading]);

  // Sync with localStorage on mount in case it changed externally
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "themeMode" && event.newValue) {
        setMode(event.newValue as ThemeMode);
      } else if (event.key === "colorPalette" && event.newValue) {
        setPaletteState(event.newValue as ColorPalette);
      }
    };

    // Listen for changes to localStorage from other tabs/windows
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
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
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
