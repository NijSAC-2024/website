import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Event, EventContent, Registration, Location } from '../types.ts';
import { useAppState } from './AppStateProvider.tsx';
import { apiFetch } from '../api.ts';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from './AuthProvider.tsx';

interface ApiContextType {
  events?: Event[];
  locations?: Location[];
  event?: Event;
  registrations?: Registration[];
  updateEvent: (id: string, event: EventContent) => Promise<void>;
  createEvent: (event: EventContent) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const { route } = useAppState();
  const { isLoggedIn } = useAuth();
  // We use this boolean to invalidate cached API calls whenever an item gets updated.
  // The `useEffects` depend on the boolean to trigger a reload on any change
  const [cache, setCache] = useState<boolean>(false);
  const [events, setEvents] = useState<Array<Event>>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [locations, setLocations] = useState<Array<Location> | undefined>(undefined);
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);

  const updateEvent = async (id: string, event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>(`/event/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    setEvent(updatedEvent);
    setCache(!cache);
    enqueueSnackbar('saved', {
      variant: 'success'
    });
  };

  const createEvent = async (event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>('/event', {
      method: 'POST',
      body: JSON.stringify(event)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    setEvent(updatedEvent);
    setCache(!cache);
    enqueueSnackbar('saved', {
      variant: 'success'
    });
  };

  useEffect(() => {
    if (route.name === 'agenda') {
      apiFetch<Array<Event>>('/event').then(({ error, data: events }) => {
        if (error) {
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error'
          });
        }
        if (events) {
          setEvents(events);
        }
      });
    }
  }, [cache, route.name]);

  useEffect(() => {
    if (route.name === 'event' || route.name == 'new_event') {
      apiFetch<Array<Location>>('/location').then(({ error, data: locations }) => {
        if (error) {
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error'
          });
        }
        if (locations) {
          setLocations(locations);
        }
      });
    }
  }, [cache, route.name]);

  useEffect(() => {
    if (route.name === 'event') {
      apiFetch<Event>(`/event/${route.params!.id}`).then(({ error, data: event }) => {
        if (error) {
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error'
          });
        }
        if (event) {
          setEvent(event);
        }
      });
      if (isLoggedIn) {
        apiFetch<Array<Registration>>(`/event/${route.params!.id}/registration`).then(
          ({ error, data: registrations }) => {
            if (error) {
              enqueueSnackbar(`${error.message}: ${error.reference}`, {
                variant: 'error'
              });
            }
            if (registrations) {
              setRegistrations(registrations);
            }
          }
        );
      }
    }
  }, [cache, route.name, route.params, isLoggedIn]);

  return (
    <ApiContext.Provider
      value={{
        events,
        event,
        locations,
        registrations,
        updateEvent,
        createEvent
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
