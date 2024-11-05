import { ReactNode } from 'react';
import AuthProvider from './AuthProvider.tsx';
import ThemeProvider from './ThemeProvider.tsx';
import LanguageProvider from './LanguageProvider.tsx';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
