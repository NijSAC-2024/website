import {ActionDispatch, createContext, useContext, useEffect, useReducer} from 'react';
import {Action, State} from '../types.ts';
import {useRouter} from './useRouter.ts';
import {routes} from '../routes.ts';
import {Navigate, Router} from '../router.ts';
import {reducer} from '../reducer.ts';
import apiMiddleware from '../apiMiddleware.ts';
import {WebsiteError} from '../error/error.ts';

export const WebsiteContext = createContext<{
  state: State;
  dispatch: ActionDispatch<[Action]>;
  navigate: Navigate;
  match: Router['match'];
}>({
  state: {
    user: null,
    routerState: {
      name: 'index',
      params: {},
    },
    nextRouterState: null,
    error: null,
    version: 'dev',
    events: null,
    registrations: null,
    userEventRegistrations: null,
    locations: null,
    myCommittees: null,
    committees: null,
    committeeMembers: null,
    users: null,
    forceReload: false,
    currentUser: null
  },
  dispatch: () => {
    throw new Error('WebsiteContext must be used within WebsiteProvider');
  },
  navigate: () => {
    throw new Error('WebsiteContext must be used within WebsiteProvider');
  },
  match: () => {
    throw new Error('WebsiteContext must be used within WebsiteProvider');
  },
});

export function useWebsite() {
  return useContext(WebsiteContext);
}

const router = new Router(routes);

export function useLoadWebsite() {
  const [state, dispatch] = useReducer(reducer, {
    currentUser: null,
    forceReload: false,
    committeeMembers: null,
    committees: null,
    myCommittees: null,
    users: null,
    locations: null,
    userEventRegistrations: null,
    user: null,
    events: null,
    registrations: null,
    version: 'dev',
    error: null,
    routerState: router.initialState,
    nextRouterState: null
  });

  const {navigate} = useRouter(router, state, dispatch, [apiMiddleware]);

  useEffect(() => {
    // initial navigation
    const route = router.match(window.location.pathname + window.location.search);

    if (route) {
      navigate(route.name, route.params);
    } else {
      throw new WebsiteError(`Route ${window.location.pathname} doesn't exist`, 404);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    dispatch,
    navigate,
    match: router.match.bind(router),
  };
}
