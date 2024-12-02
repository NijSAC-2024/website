import { createContext, useContext, ReactNode, useState } from 'react';
import { AuthContextType, UserType } from '../types.ts';
import { enqueueSnackbar } from 'notistack';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [user, setUser] = useState<UserType | undefined>(undefined);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/whoami', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const body = await response.json();
        setUser(body);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      enqueueSnackbar(String(error), {
        variant: 'error'
      });
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(undefined);
        enqueueSnackbar('You logged out.', {
          variant: 'success'
        });
      }
    } catch (error) {
      enqueueSnackbar(String(error), {
        variant: 'error'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, checkAuth, logout }}>
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
