import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Event, Location} from '../types.ts';
import { useAppState } from './AppStateProvider.tsx';
import { apiFetch } from '../api.ts';
import { enqueueSnackbar } from 'notistack';

interface ApiContextType {
  events?: Event[];
  locations?: Location[];
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const { route } = useAppState();
  const [events, setEvents] = useState<Array<Event>>([]);
  const [locations, setLocations] = useState<Array<Location> | undefined>(
    undefined,
  );


  useEffect(() => {
    if (route.name === 'agenda') {
      apiFetch<Array<Event>>('/event').then(({ error, data: events }) => {
        if (error) {
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error',
          });
        }
        if (events) {
          setEvents(events);
        }
      });
    } else {
      setEvents([]);
    }
  }, [route.name]);

  useEffect(() => {
    if (route.name === 'event' || route.name == 'new_event' || route.name == 'edit_event') {
      apiFetch<Array<Location>>('/location').then(
        ({ error, data: locations }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error',
            });
          }
          if (locations) {
            setLocations(locations);
          }
        },
      );
    } else {
      setLocations([])
    }
  }, [route.name]);

  return (
    <ApiContext.Provider
      value={{
        events,
        locations,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export const useApiState = (): ApiContextType => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error('useApiState must be used within a ApiProvider');
  }

  return context;
};
