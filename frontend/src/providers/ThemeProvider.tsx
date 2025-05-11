import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeCookie, setThemeCookie] = useCookies(['theme']);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (themeCookie.theme) {
      return themeCookie.theme;
    } else {
      return false;
    }
  });

  useEffect(() => {
    setThemeCookie('theme', isDarkMode.toString(), {
      secure: true,
      sameSite: 'strict'
    });

    const rootElement = document.querySelector('#root');
    if (rootElement) {
      if (isDarkMode) {
        rootElement.classList.add('dark');
      } else {
        rootElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme
    }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
