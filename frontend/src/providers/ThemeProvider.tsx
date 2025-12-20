import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useCookies} from 'react-cookie';
import {ThemeType} from '../types.ts';

interface ThemeContextType {
  themeMode: ThemeType;
  checkDarkMode: () => boolean;
  setTheme: (mode: 'dark' | 'light' | 'auto') => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({children}: ThemeProviderProps) {
  const [themeCookie, setThemeCookie] = useCookies(['theme']);
  const [themeMode, setThemeMode] = useState<ThemeType>(themeCookie.theme ? themeCookie.theme : 'dark');

  const checkDarkMode = () => {
    return themeMode === 'dark' || (themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }


  useEffect(() => {
    const rootElement = document.querySelector('#root');
    if (rootElement) {
      if (checkDarkMode()) {
        rootElement.classList.add('dark');
      } else {
        rootElement.classList.remove('dark');
      }
    }
  });

  const setTheme = (mode: 'dark' | 'light' | 'auto') => {
    setThemeCookie('theme', mode, {
      secure: true,
      sameSite: 'strict'
    });
    setThemeMode(mode);
  };

  return (
    <ThemeContext.Provider value={{themeMode, checkDarkMode, setTheme}}>{children}</ThemeContext.Provider>
  );
}

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
