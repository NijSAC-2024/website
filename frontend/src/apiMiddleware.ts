import {Dispatch} from 'react';
import {NavigationState} from './hooks/useRouter';
import {Action, User} from './types';
import {FullRouterState, Router} from './router';
import {WebsiteError} from './error/error';

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new WebsiteError(`Failed to fetch ${path} (${response.status} ${response.statusText})`, response.status);
  }

  return (await response.json()) as T;
}

export default async function apiMiddleware(
  navState: NavigationState,
  router: Router,
  dispatch: Dispatch<Action>
): Promise<FullRouterState> {
  let user: User | null = null;

  if (navState.state.user === null) {
    const response = await fetch('/api/whoami', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 401) {
      dispatch({type: 'set_user', user: null});
    } else if (response.ok) {
      user = (await response.json()) as User;
      dispatch({type: 'set_user', user: user});
    } else {
      throw new WebsiteError(`Failed to check login status: (${response.status} ${response.statusText})`, response.status);
    }
  } else {
    user = navState.state.user;
  }

  if (!navState.state.events && navState.state.events === null) {
    dispatch({type: 'set_events', events: await get('/api/event')});
  }

  if (!navState.state.registrations && navState.to.name === 'events.event') {
    dispatch({
      type: 'set_event_registrations',
      registrations: await get(`/api/event/${navState.to.params.event_id}/registration`)
    });
  }

  if (user && !navState.state.userEventRegistrations && navState.to.name === 'events') {
    dispatch({
      type: 'set_user_event_registrations',
      registrations: await get(`/api/user/${user.id}/event_registrations`)
    });
  }

  if (!navState.state.locations && navState.to.name.startsWith('events')) {
    dispatch({
      type: 'set_locations',
      locations: await get('/api/location')
    });
  }

  if (user && !navState.state.myCommittees) {
    dispatch({
      type: 'set_my_committees',
      committees: await get(`/api/user/${user.id}/committees`)
    });
  }

  if (!navState.state.committees) {
    dispatch({
      type: 'set_committees',
      committees: await get('/api/committee')
    });
  }

  if (user &&
    !navState.state.committeeMembers &&
    navState.to.name.startsWith('committees.committee')) {
    dispatch({
      type: 'set_committee_members',
      members: await get(`/api/committee/${navState.to.params.committee_id}/members`)
    });
  }

  return navState.to;
}
