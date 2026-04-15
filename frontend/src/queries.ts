import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api.ts';
import { WebsiteError } from './error/error.ts';
import { Committee, CommitteeUser, Event, Location, Registration, User, UserCommittee } from './types.ts';
import {useDispatch} from 'react-redux';

export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'] as const,
  },
  events: {
    all: () => ['events'] as const,
    detail: (eventId: string) => ['events', eventId] as const,
    registrations: (eventId: string) => ['events', eventId, 'registrations'] as const,
  },
  locations: {
    all: () => ['locations'] as const,
  },
  committees: {
    all: () => ['committees'] as const,
    detail: (committeeId: string) => ['committees', committeeId] as const,
    members: (committeeId: string) => ['committees', committeeId, 'members'] as const,
  },
  users: {
    all: () => ['users'] as const,
    detail: (userId: string) => ['users', userId] as const,
    registrations: (userId: string) => ['users', userId, 'registrations'] as const,
    committees: (userId: string) => ['users', userId, 'committees'] as const,
  },
};

async function getOrThrow<T>(url: string): Promise<T> {
  const {data, error} = await apiFetch<T>(url);
  if (error) {
    throw new WebsiteError(`${error.message}: ${error.reference}`, error.status);
  }
  return data;
}

async function getOptionalUser(): Promise<User | null> {
  const {data, error} = await apiFetch<User>('/whoami');
  if (error) {
    if (error.status === 401) {
      return null;
    }
    throw new WebsiteError(`${error.message}: ${error.reference}`, error.status);
  }
  return data;
}

function useSyncQueryError(error: Error | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (error instanceof WebsiteError) {
      dispatch({type: 'set_error', error});
    }
  }, [dispatch, error]);
}

export function useAuthQuery() {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: getOptionalUser,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data === undefined) {
      return;
    }

    if (query.data === null) {
      dispatch({type: 'logout'});
      return;
    }

    dispatch({type: 'login', user: query.data});
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useEventsQuery(enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.events.all(),
    queryFn: () => getOrThrow<Event[]>('/event'),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_events', events: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useLocationsQuery(enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.locations.all(),
    queryFn: () => getOrThrow<Location[]>('/location'),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_locations', locations: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useCommitteesQuery(enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.committees.all(),
    queryFn: () => getOrThrow<Committee[]>('/committee'),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_committees', committees: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useUsersQuery(enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: () => getOrThrow<User[]>('/user'),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_users', users: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useUserDetailQuery(userId: string, enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getOrThrow<User>(`/user/${userId}`),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_current_user', user: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useUserRegistrationsQuery(userId: string, enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.users.registrations(userId),
    queryFn: () => getOrThrow<Registration[]>(`/user/${userId}/event_registrations`),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_user_event_registrations', registrations: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useUserCommitteesQuery(
  userId: string,
  target: 'mine' | 'current',
  enabled = true
) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.users.committees(userId),
    queryFn: () => getOrThrow<UserCommittee[]>(`/user/${userId}/committees`),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    dispatch({
      type: target === 'mine' ? 'set_my_committees' : 'set_current_committees',
      committees: query.data,
    });
  }, [dispatch, query.data, target]);

  useSyncQueryError(query.error);
  return query;
}

export function useCommitteeMembersQuery(committeeId: string, enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.committees.members(committeeId),
    queryFn: () => getOrThrow<CommitteeUser[]>(`/committee/${committeeId}/members`),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_committee_members', members: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}

export function useEventRegistrationsQuery(eventId: string, enabled = true) {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.events.registrations(eventId),
    queryFn: () => getOrThrow<Registration[]>(`/event/${eventId}/registration`),
    enabled,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({type: 'set_event_registrations', registrations: query.data});
    }
  }, [dispatch, query.data]);

  useSyncQueryError(query.error);
  return query;
}