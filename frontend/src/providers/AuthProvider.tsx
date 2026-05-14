import { createContext, ReactNode, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '../types';
import { UserError } from '../error/error';
import {apiFetch} from '../api.ts';
import {queryKeys} from '../queries.ts';

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: AuthProviderProps) {
  const { data, isLoading } = useQuery<User | null>({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      try {
        return await apiFetch<User>('/whoami');
      } catch (e) {
        if (e instanceof UserError && e.status === 401) {
          return null;
        }
        throw e;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const value: AuthContextType = {
    user: isLoading ? undefined : data ?? null,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};