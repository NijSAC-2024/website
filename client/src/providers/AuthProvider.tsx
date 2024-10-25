import { createContext, useContext, useMemo, ReactNode } from 'react';
import { AuthContextType } from '../types.ts';
import { useCookies } from 'react-cookie';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [authCookie, setCookie, removeCookie] = useCookies(['token']);
  const login = ({ token }: { token: string }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCookie('token', token, { expires: tomorrow, secure: true, sameSite: 'strict' });
  };

  const logout = () => {
    removeCookie('token');
  };

  const checkAuth = () => {
    return authCookie.token != undefined;
  };

  const value = useMemo(
    () => ({
      authCookie,
      login,
      logout,
      checkAuth
    }),
    [authCookie]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
