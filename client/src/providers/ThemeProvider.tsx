import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeContextType } from '../types.ts';
import { useCookies } from 'react-cookie';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeCookie, setCookie] = useCookies(['theme']);

  const toggleTheme = () => {
    setCookie('theme', !themeCookie.theme, { secure: true, sameSite: 'strict' });
  };

  const value = useMemo(
    () => ({
      themeCookie,
      toggleTheme
    }),
    [themeCookie]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom hook to use the providers context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAuth must be used within a ThemeProvider');
  }
  return context;
};
