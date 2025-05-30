import { createContext, ReactNode, useContext, useState } from 'react';
import { Route } from '../types.ts';
import { matchName, paramsToPath } from '../router.ts';

interface AppStateContextType {
  version: string;
  route: Route;
  navigate: (routeName: string, params?: Record<string, string>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

interface AppStateProviderProps {
  children: ReactNode;
}

export default function AppStateProvider({ children }: AppStateProviderProps) {
  const [version, _setVersion] = useState<string>('development');
  const [route, setRoute] = useState<Route>({ path: '/', name: 'index', params: {} });

  const navigate = (routeName: string, params?: Record<string, string>) => {
    const route = matchName(routeName);
    if (!route) {
      throw Error('Unknown route: ' + routeName);
    }

    const current = window.location.pathname;
    route.params = params;

    paramsToPath(route, params);
    if (current !== route.path) {
      history.pushState({ route }, '', route.path);
    }
    setRoute(route);
  };

  return (
    <AppStateContext.Provider value={{ version, route, navigate }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }

  return context;
};
