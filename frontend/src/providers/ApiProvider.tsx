import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Event, EventContent, Registration, Location, Answer} from '../types.ts';
import { useAppState } from './AppStateProvider.tsx';
import { apiFetch } from '../api.ts';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from './AuthProvider.tsx';
import {useLanguage} from './LanguageProvider.tsx';

interface ApiContextType {
  events?: Event[];
  locations?: Location[];
  event?: Event;
  registrations?: Registration[];
  updateEvent: (eventId: string, event: EventContent) => Promise<void>;
  createEvent: (event: EventContent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateRegistration: (eventId: string, answers: Answer[]) => Promise<void>;
  createRegistration: (eventId: string, answers: Answer[]) => Promise<void>;
  deleteRegistration: (eventId: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const { route } = useAppState();
  const { user } = useAuth()
  const { isLoggedIn } = useAuth();
  const { text } = useLanguage();
  // We use this boolean to invalidate cached API calls whenever an item gets updated.
  // The `useEffects` depend on the boolean to trigger a reload on any change
  const [cache, setCache] = useState<boolean>(false);
  const [events, setEvents] = useState<Array<Event>>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [locations, setLocations] = useState<Array<Location> | undefined>(
    undefined,
  );
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);

  const updateEvent = async (eventId: string, event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>(
      `/event/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(event),
      },
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      });
      return;
    }
    setEvent(updatedEvent);
    setCache(!cache);
    enqueueSnackbar(text('Event updated', 'Evenement bijgewerkt'), {
      variant: 'success',
    });
  };

  const createEvent = async (event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>('/event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      });
      return;
    }
    setEvent(updatedEvent);
    setCache(!cache);
    enqueueSnackbar(text('Event created', 'Evenement aangemaakt'), {
      variant: 'success',
    });
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await apiFetch(`/event/${eventId}`, {
      method: 'DELETE',
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Event deleted', 'Evenement verwijderd'), {
      variant: 'success',
    });
  };

  const updateRegistration = async (eventId: string, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration/${user?.id}`, {
      method: 'PUT',
      body: JSON.stringify({answers}),
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      });
      return;
    }

    setCache(!cache);
    enqueueSnackbar(text('Registration updated', 'Inschrijving bijgewerkt'), {
      variant: 'success',
    });
  };


  const createRegistration = async (eventId: string, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration/${user?.id}`, {
      method: 'POST',
      body: JSON.stringify({answers}),
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Registered', 'Ingeschreven'), {
      variant: 'success',
    });
  }

  const deleteRegistration = async (eventId: string) => {
    const { error } = await apiFetch(`/event/${eventId}/registration/${user?.id}`, {
      method: 'DELETE',
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Deregistered', 'Uitgeschreven'), {
      variant: 'success',
    });
  };


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
    }
  }, [cache, route.name]);

  useEffect(() => {
    if (route.name === 'event' || route.name == 'new_event') {
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
    }
  }, [cache, route.name]);

  useEffect(() => {
    if (route.name === 'event') {
      apiFetch<Event>(`/event/${route.params!.id}`).then(
        ({ error, data: event }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error',
            });
          }
          if (event) {
            setEvent(event);
          }
        },
      );
      if (isLoggedIn) {
        apiFetch<Array<Registration>>(
          `/event/${route.params!.id}/registration`,
        ).then(({ error, data: registrations }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error',
            });
          }
          if (registrations) {
            setRegistrations(registrations);
          }
        });
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
        createEvent,
        deleteEvent,
        updateRegistration,
        createRegistration,
        deleteRegistration
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
