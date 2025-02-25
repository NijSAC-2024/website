import { createContext, ReactNode, useContext, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { apiFetch, apiFetchVoid } from '../api.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | undefined;
  isLoggedIn: boolean;
  checkAuth: () => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  authOpen: boolean;
  toggleAuthOpen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [authOpen, setAuthOpen] = useState<boolean>(false);

  const toggleAuthOpen = () => {
    setAuthOpen((prevState) => !prevState);
  };

  const checkAuth = async () => {
    const { error, data } = await apiFetch<User>('/whoami');

    if (!error) {
      setUser(data);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    const { error } = await apiFetch<void>('/logout', { method: 'GET' });

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

  const login = async (email: string, password: string) => {
    const { error } = await apiFetchVoid('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (error) {
      switch (error.message) {
      case 'Unauthorized':
        enqueueSnackbar('Incorrect email or password.', { variant: 'error' });
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, {
          variant: 'error'
        });
      }
    } else {
      await checkAuth();
      enqueueSnackbar('You logged in', { variant: 'success' });
      toggleAuthOpen();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, checkAuth, login, logout, authOpen, toggleAuthOpen }}>
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
