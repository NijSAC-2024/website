import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  Answer, BasicUser,
  Committee, CommitteeContent,
  Event,
  EventContent,
  Location,
  Registration,
  toEventContent,
  User, UserCommittee,
  UserContent
} from '../types.ts';
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
  committee?: Committee;
  committees: Committee[];
  committeeMembers: BasicUser[];
  userCommittees: UserCommittee[];
  users: User[];
  createEvent: (event: EventContent) => Promise<void>;
  updateEvent: (eventId: string, event: EventContent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  getRegistration: (eventId: string, registrationId: string) => Promise<Registration | undefined>;
  createRegistration: (eventId: string, userId: string | undefined, answers: Answer[]) => Promise<void>;
  updateRegistration: (eventId: string, registrationId: string, answers: Answer[], attended?: boolean, waitingListPosition?: number) => Promise<void>;
  deleteRegistration: (eventId: string, registrationId: string) => Promise<void>;
  createUser: (user: UserContent) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  updateUserPassword: (userId: string, password: string) => Promise<void>;
  createCommittee: (committee: CommitteeContent) => Promise<void>;
  updateCommittee: (id: string, committee: CommitteeContent) => Promise<void>;
  deleteCommittee: (id: string) => Promise<void>;
  addUserToCommittee: (committeeId: string, userId: string) => Promise<void>;
  removeUserFromCommittee: (committeeId: string, userId: string) => Promise<void>;
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
  const [committee, setCommittee] = useState<Committee | undefined>(undefined);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<BasicUser[]>([]);
  const [userCommittees, setUserCommittees] = useState<UserCommittee[]>([]);
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Registration[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  //LOCATIONS
  const getLocations = async () => {
    const { error, data } = await apiFetch<Array<Location>>('/location');
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    if (data) {
      setLocations(data);
    }
  };

  //EVENTS
  const getEvents = async () => {
    const { error, data } = await apiFetch<Array<Event>>('/event');
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    if (data)
    {
      setEvents(data);
    }
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
  const getRegisteredEvents = async (userId?: string) => {
    if (!userId) {
      setRegisteredEvents([]);
      return;
    }
    const { error, data } = await apiFetch<Array<Registration>>(`/user/${userId}/event_registrations`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
    }
    if (data) {
      setRegisteredEvents(data);
    }
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

  const createRegistration = async (eventId: string, userId: string | undefined, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration`, {
      method: 'POST',
      body: JSON.stringify({ userId: userId, answers })
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Registered', 'Ingeschreven'), { variant: 'success' });
  };

  const updateRegistration = async (eventId: string, registrationId: string, answers: Answer[], attended?: boolean, waitingListPosition?: number) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify({ answers: answers, attended: attended, waitingListPosition: waitingListPosition })
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
    if (data) {
      setUsers(data);
    }
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

  //COMMITTEES
  const getCommittees = async () => {
    const { error, data } = await apiFetch<Committee[]>('/committee');
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    if (data) {
      setCommittees(data);
    }
  };

  const getCommittee = async (id: string) => {
    const { error, data } = await apiFetch<Committee>(`/committee/${id}`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    if (data) {
      setCommittee(data);
    }
  };

  const createCommittee = async (committee: CommitteeContent) => {
    const { error } = await apiFetch<Committee>('/committee', {
      method: 'POST',
      body: JSON.stringify(committee)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Committee created', 'Commissie aangemaakt'), { variant: 'success' });
  };

  const updateCommittee = async (id: string, committee: CommitteeContent) => {
    const { error } = await apiFetch<Committee>(`/committee/${id}`, {
      method: 'PUT',
      body: JSON.stringify(committee)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    enqueueSnackbar(text('Committee updated', 'Commissie bijgewerkt'), { variant: 'success' });
    setCache(!cache);
  };

  const deleteCommittee = async (id: string) => {
    const { error } = await apiFetchVoid(`/committee/${id}`, { method: 'DELETE' });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    setCache(!cache);
    enqueueSnackbar(text('Committee deleted', 'Commissie verwijderd'), { variant: 'success' });
  };

  const addUserToCommittee = async (committeeId: string, userId: string) => {
    const { error } = await apiFetchVoid(`/committee/${committeeId}/user/${userId}`, { method: 'POST' });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    enqueueSnackbar(text('User added to committee', 'Gebruiker toegevoegd aan commissie'), { variant: 'success' });
  };

  const removeUserFromCommittee = async (committeeId: string, userId: string) => {
    const { error } = await apiFetchVoid(`/committee/${committeeId}/user/${userId}`, { method: 'DELETE' });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    enqueueSnackbar(text('User removed from committee', 'Gebruiker verwijderd van commissie'), { variant: 'success' });
  };

  const getCommitteeMembers = async (id: string) => {
    const { error, data } = await apiFetch<BasicUser[]>(`/committee/${id}/members`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    if (data) {
      setCommitteeMembers(data);
    }
  };

  const getUserCommittees = async (userId?: string) => {
    if (!userId) {
      setUserCommittees([]);
      return;
    }
    const { error, data } = await apiFetch<UserCommittee[]>(`/user/${userId}/committees`);
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    if (data) {
      setUserCommittees(data);
    }
  };

  //USE EFFECTS

  // On the events page, fetch the events
  useEffect(() => {
    if (route.name === 'events' || route.name === 'account') {
      getEvents();
    } else {
      setEvents([]);
    }
  }, [route.name]);

  useEffect(() => {
    if (route.name === 'committees' || route.name === 'account') {
      getCommittees();
    } else {
      setCommittees([]);
    }
  }, [route.name]);

  useEffect(() => {
    if (route.name === 'committee') {
      getCommittee(route.params!.id);
      if (user) {
        getCommitteeMembers(route.params!.id);
      }
    } else {
      setEvents([]);
    }
  }, [route.name, route.params, user]);

  useEffect(() => {
    if ((route.name === 'events' || route.name === 'event' || route.name === 'account') && isLoggedIn) {
      getRegisteredEvents(user?.id);
    } else {
      setRegisteredEvents([]);
    }
  }, [cache, isLoggedIn, route.name, user?.id]);

  useEffect(() => {
    if ((route.name === 'account' || route.name === 'committee') && isLoggedIn) {
      getUserCommittees(user?.id);
    } else {
      setUserCommittees([]);
    }
  }, [cache, isLoggedIn, route.name, user?.id]);

  useEffect(() => {
    if (route.name === 'event' || route.name === 'new_event' || route.name === 'edit_event') {
      getLocations();
    } else {
      setLocations([]);
    }
  }, [route.name]);

  useEffect(() => {
    if ((route.name === 'members' || route.name === 'event') && isLoggedIn && !(user?.status === 'pending')) {
      getUsers();
    }
  }, [cache, isLoggedIn, route.name, user?.status]);

  useEffect(() => {
    if (route.name === 'event') {
      getEvent(route.params!.id).then(event => {
        if (event) {
          setEvent(event);
          if ((user && event.requiredMembershipStatus.includes(user.status)) || event.requiredMembershipStatus.includes('nonMember')) {
            getRegistrations(route.params!.id).then(registrations => {
              if (registrations) {
                setRegistrations(registrations);
              }
            });
          }
        }
      });
    }
  }, [cache, route.name, route.params, isLoggedIn, user?.status, user]);

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
        committee,
        committees,
        committeeMembers,
        userCommittees,
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
        updateUserPassword,
        createCommittee,
        updateCommittee,
        deleteCommittee,
        addUserToCommittee,
        removeUserFromCommittee
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
