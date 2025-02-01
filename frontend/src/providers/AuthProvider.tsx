import { createContext, useContext, ReactNode, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { apiFetch } from '../api.ts';
import { UserType } from '../types.ts';

interface AuthContextType {
  user: UserType | undefined;
  isLoggedIn: boolean;
  checkAuth: () => void;
  logout: () => void;
  authOpen: boolean;
  toggleAuthOpen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [user, setUser] = useState<UserType | undefined>(undefined);

  const [authOpen, setAuthOpen] = useState<boolean>(false);

  const toggleAuthOpen = () => {
    setAuthOpen((prevState) => !prevState);
  };

  const checkAuth = async () => {
    const { error, data } = await apiFetch<UserType>('/api/whoami');

    if (!error) {
      setUser(data);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    const { error } = await apiFetch<void>('/api/logout', { method: 'GET' });

    if (!error) {
      setIsLoggedIn(false);
      setUser(undefined);
      enqueueSnackbar('You logged out.', {
        variant: 'success'
      });
    } else {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, checkAuth, logout, authOpen, toggleAuthOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
};
