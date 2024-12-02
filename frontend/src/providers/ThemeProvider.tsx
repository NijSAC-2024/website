import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeContextType } from '../types.ts';
import { useCookies } from 'react-cookie';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeCookie, setThemeCookie] = useCookies(['theme']);
  const toggleTheme = () => {
    setThemeCookie('theme', !themeCookie.theme, { secure: true, sameSite: 'strict' });
  };

  const getThemeName = () => {
    return themeCookie.theme ? 'dark' : 'light';
  };

  const value = useMemo(
    () => ({
      themeCookie,
      getThemeName,
      toggleTheme
    }),
    [themeCookie]
  );

  const rootElement = document.querySelector('#root');
  if (rootElement) {
    if (getThemeName() === 'dark') {
      rootElement.classList.add('dark'); // classList is internally a set, so it doesn't matter if we add it twice
    } else {
      rootElement.classList.remove('dark');
    }
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
