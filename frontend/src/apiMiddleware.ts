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
  _router: Router,
  dispatch: Dispatch<Action>
): Promise<FullRouterState> {
  let user: User | null = null;

  if (navState.state.user === null || navState.state.forceReload) {
    const response = await fetch('/api/whoami', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 401) {
      dispatch({type: 'logout'});
    } else if (response.ok) {
      user = (await response.json()) as User;
      dispatch({type: 'login', user: user});
    } else {
      throw new WebsiteError(`Failed to check login status: (${response.status} ${response.statusText})`, response.status);
    }
  } else {
    user = navState.state.user;
  }

  const forceReload = navState.state.forceReload;

  let events = navState.state.events;
  if (!navState.state.events || forceReload) {
    events = await get('/api/event');
    dispatch({type: 'set_events', events});
  }

  if (!navState.state.locations && navState.to.name.startsWith('events')) {
    dispatch({
      type: 'set_locations',
      locations: await get('/api/location')
    });
  }


  if (!navState.state.committees) {
    dispatch({
      type: 'set_committees',
      committees: await get('/api/committee')
    });
  }

  if (user) {
    if ((user.status === 'member' || user.status === 'affiliated')) {
      if ((!navState.state.userEventRegistrations || forceReload) && navState.to.name.startsWith('events')) {
        dispatch({
          type: 'set_user_event_registrations',
          registrations: await get(`/api/user/${user.id}/event_registrations`)
        });
      }

      if ((forceReload || !navState.state.users) && navState.to.name === 'members') {
        dispatch({
          type: 'set_users',
          users: await get('/api/user'),
        });
      }

      if ((!navState.state.userEventRegistrations || forceReload) && navState.to.name === 'user') {
        dispatch({
          type: 'set_user_event_registrations',
          registrations: await get(`/api/user/${navState.to.params.user_id}/event_registrations`)
        });
      }

      if ((forceReload || navState.to.params.committee_id !== navState.from.params.committee_id) &&
        navState.to.name.startsWith('committees.committee')) {
        dispatch({
          type: 'set_committee_members',
          members: await get(`/api/committee/${navState.to.params.committee_id}/members`)
        });
      }
    }
    if ((navState.state.currentUser?.id !== navState.to.params.user_id || forceReload) &&
      navState.to.name.startsWith('user')) {
      dispatch({
        type: 'set_current_user',
        user: await get(`/api/user/${navState.to.params.user_id}`)
      });
      dispatch({
        type: 'set_my_committees',
        committees: await get(`/api/user/${navState.to.params.user_id}/committees`)
      });
    }
  }

  if (navState.to.params.event_id !== navState.from.params.event_id || forceReload) {
    if (navState.to.name === 'events.event') {
      const currentEvent = events?.find((e) => e.id === navState.to.params.event_id);
      if (currentEvent &&
        ((user &&
            currentEvent.requiredMembershipStatus.includes(user.status))
          || currentEvent.requiredMembershipStatus.includes('nonMember'))) {
        dispatch({
          type: 'set_event_registrations',
          registrations: await get(`/api/event/${navState.to.params.event_id}/registration`)
        });
      }
    }
  }

  if (forceReload) {
    dispatch({type: 'reset_force_reload'});
  }

  return navState.to;
}
