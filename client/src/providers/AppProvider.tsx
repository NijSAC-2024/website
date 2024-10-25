import { ReactNode } from 'react';
import AuthProvider from './AuthProvider.tsx';
import ThemeProvider from './ThemeProvider.tsx';
import AlertProvider from './AlertProvider.tsx';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertProvider>{children}</AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
