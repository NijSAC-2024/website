import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Answer, Event, EventContent, Location, Registration, toEventContent, User, UserContent } from '../types.ts';
import { useAppState } from './AppStateProvider.tsx';
import { apiFetch, apiFetchVoid } from '../api.ts';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from './AuthProvider.tsx';
import { useLanguage } from './LanguageProvider.tsx';

interface ApiContextType {
  events?: Event[];
  locations?: Location[];
  event?: Event;
  eventContent?: EventContent;
  registrations?: Registration[];
  // TODO find a better name
  // Holds the registrations a logged-in user is registered for
  registeredEvents: Registration[];
  users: User[];
  createEvent: (event: EventContent) => Promise<void>;
  updateEvent: (eventId: string, event: EventContent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  getRegistration: (eventId: string, registrationId: string) => Promise<Registration | undefined>;
  createRegistration: (eventId: string, answers: Answer[]) => Promise<void>;
  updateRegistration: (eventId: string, registrationId: string, answers: Answer[]) => Promise<void>;
  deleteRegistration: (eventId: string, registrationId: string) => Promise<void>;
  createUser: (user: UserContent) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  updateUserPassword: (userId: string, password: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const { route } = useAppState();
  const { user, setUser } = useAuth();
  const { isLoggedIn } = useAuth();
  const { text } = useLanguage();
  // We use this boolean to invalidate cached API calls whenever an item gets updated.
  // The `useEffects` depend on the boolean to trigger a reload on any change
  const [cache, setCache] = useState<boolean>(false);
  const [events, setEvents] = useState<Array<Event>>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [locations, setLocations] = useState<Array<Location> | undefined>(
    undefined
  );
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Registration[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  //LOCATIONS
  const getLocations = async (): Promise<Location[] | undefined> => {
    const { error, data } = await apiFetch<Array<Location>>('/location');
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data;
  };

  //EVENTS
  const getEvents = async (): Promise<Event[] | undefined> => {
    const { error, data } = await apiFetch<Array<Event>>('/event');
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data;
  };

  const getEvent = async (id: string): Promise<Event | undefined> => {
    const { error, data } = await apiFetch<Event>(`/event/${id}`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data;
  };
  const createEvent = async (event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>('/event', {
      method: 'POST',
      body: JSON.stringify(event)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setEvent(updatedEvent);
    setCache(!cache);
    enqueueSnackbar(text('Event created', 'Evenement aangemaakt'), { variant: 'success' });
  };

  const updateEvent = async (eventId: string, eventContent: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>(`/event/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(eventContent)
      }
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setEvent(updatedEvent);
    setCache(!cache);
    enqueueSnackbar(text('Event updated', 'Evenement bijgewerkt'), { variant: 'success' });
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await apiFetch(`/event/${eventId}`, {
      method: 'DELETE'
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Event deleted', 'Evenement verwijderd'), { variant: 'success' });
  };

  // REGISTRATIONS
  const getRegisteredEvents = async (userId?: string): Promise<Registration[] | undefined> => {
    if (!userId) {
      return [];
    }
    const { error, data } = await apiFetch<Array<Registration>>(`/user/${userId}/event_registrations`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data;
  };

  const getRegistrations = async (eventId: string): Promise<Registration[] | undefined> => {
    const { error, data } = await apiFetch<Array<Registration>>(`/event/${eventId}/registration`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data;
  };

  const getRegistration = async (eventId: string, registrationId: string): Promise<Registration | undefined> => {
    const { error, data } = await apiFetch<Registration>(
      `/event/${eventId}/registration/${registrationId}`
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data;
  };

  const createRegistration = async (eventId: string, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration`, {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id, answers })
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Registered', 'Ingeschreven'), { variant: 'success' });
  };

  const updateRegistration = async (eventId: string, registrationId: string, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify({ answers })
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Registration updated', 'Inschrijving bijgewerkt'), { variant: 'success' });
  };

  const deleteRegistration = async (eventId: string, registrationId: string) => {
    const { error } = await apiFetchVoid(`/event/${eventId}/registration/${registrationId}`, {
      method: 'DELETE'
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Deregistered', 'Uitgeschreven'), { variant: 'success' });
  };

  //USERS
  const getUsers = async () => {
    const { error, data } = await apiFetch<User[]>('/user');
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    return data || [];
  };

  const createUser = async (user: UserContent) => {
    const { error } = await apiFetch<void>('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (error) {
      switch (error.message) {
      case 'Conflict':
        enqueueSnackbar(text('Email is already in use.', 'E-mail is al in gebruik.'), { variant: 'error' });
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      }
      return;
    }
    enqueueSnackbar(`Created account: ${user.firstName} ${user.lastName}`, { variant: 'success' });
  };

  const updateUser = async (userId: string, updatedUser: Partial<User>) => {
    const { error, data } = await apiFetch<User>(`/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    if (error) {
      switch (error.message) {
      case 'Conflict':
        enqueueSnackbar(text('Email is already in use.', 'E-mail is al in gebruik.'), { variant: 'error' });
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      }
      return;
    }
    if (data) {
      if (user?.id === data.id) {
        setUser(data);
      }
    }
    enqueueSnackbar(text('User updated', 'Gebruiker bijgewerkt'), { variant: 'success' });
    setCache(!cache);
  };

  const updateUserPassword = async (userId: string, password: string) => {
    const { error } = await apiFetchVoid(`/user/${userId}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({password})
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    enqueueSnackbar(text('Password changed', 'Wachtwoord aangepast'), { variant: 'success' });
  }

  //USE EFFECTS

  // On the agenda page, fetch the events
  useEffect(() => {
    if (route.name === 'agenda' || route.name === 'account') {
      getEvents().then(events => {
        if (events) {
          setEvents(events);
        }
      });
    } else {
      setEvents([]);
    }
  }, [cache, isLoggedIn, route.name, user?.id]);

  useEffect(() => {
    if ((route.name === 'agenda' || route.name === 'event' || route.name === 'account') && isLoggedIn && !(user?.status === 'pending')) {
      getRegisteredEvents(user?.id).then(registrations => {
        if (registrations) {
          setRegisteredEvents(registrations);
        }
      });
    } else {
      setRegisteredEvents([]);
    }
  }, [cache, isLoggedIn, route.name, user?.id]);

  useEffect(() => {
    if (route.name === 'event' || route.name === 'new_event' || route.name === 'edit_event') {
      getLocations().then(locations => {
        if (locations) {
          setLocations(locations);
        }
      });
    } else {
      setLocations([]);
    }
  }, [cache, route.name]);

  useEffect(() => {
    if (route.name === 'event') {
      getEvent(route.params!.id).then(event => {
        if (event) {
          setEvent(event);
        }
      });

      if (isLoggedIn && !(user?.status === 'pending')) {
        getRegistrations(route.params!.id).then(registrations => {
          if (registrations) {
            setRegistrations(registrations);
          }
        });
      }
    }
  }, [cache, route.name, route.params, isLoggedIn]);

  useEffect(() => {
    if (route.name === 'members' && isLoggedIn) {
      getUsers().then(users => {
        if (users) {
          setUsers(users);
        }
      });
    } else {
      setUsers([]);
    }
  }, [cache, isLoggedIn, route.name]);


  let eventContent = undefined;
  if (event) {
    eventContent = toEventContent(event);
  }

  return (
    <ApiContext.Provider
      value={{
        events,
        event,
        eventContent,
        locations,
        registrations,
        registeredEvents,
        users,
        createEvent,
        updateEvent,
        deleteEvent,
        getRegistration,
        createRegistration,
        updateRegistration,
        deleteRegistration,
        createUser,
        updateUser,
        updateUserPassword
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
