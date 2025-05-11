import { ReactNode } from 'react';
import AuthProvider from './AuthProvider.tsx';
import ThemeProvider from './ThemeProvider.tsx';
import LanguageProvider from './LanguageProvider.tsx';
import 'moment/locale/nl';
import AppStateProvider from './AppStateProvider.tsx';
import ApiProvider from './ApiProvider.tsx';
import { CookiesProvider } from 'react-cookie';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <CookiesProvider>
      <AuthProvider>
        <AppStateProvider>
          <ApiProvider>
            <ThemeProvider>
              <LanguageProvider>{children}</LanguageProvider>
            </ThemeProvider>
          </ApiProvider>
        </AppStateProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}
