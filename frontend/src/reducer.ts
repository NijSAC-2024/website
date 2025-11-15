import {Action, State} from './types';

const actionHandler: {
  [action in Action['type']]: (state: State, action: Extract<Action, { type: action }>) => State;
} = {

  set_next_router_state: function (state, action) {
    return {...state, nextRouterState: action.nextRouterState};
  },
  set_route: function (state, action) {
    return {...state, routerState: action.routerState, nextRouterState: null};
  },
  set_user: function (state, action) {
    return {...state, user: action.user, userFetched: true};
  },
  set_users: function (state, action) {
    return {...state, users: action.users, userFetched: true};
  },
  set_error: function (state, action) {
    return {...state, error: action.error};
  },
  set_events: function (state, action) {
    return {...state, events: action.events};
  },
  set_event_registrations: function (state, action) {
    return {...state, registrations: action.registrations};
  },
  set_user_event_registrations(state: State, action) {
    return {...state, userEventRegistrations: action.registrations};
  },
  set_my_committees(state: State, action) {
    return {...state, myCommittees: action.committees};
  },
  set_committees(state: State, action) {
    return {...state, committees: action.committees};
  },
  set_committee_members(state: State, action) {
    return {...state, committeeMembers: action.members};
  },
  set_locations: function (state, action) {
    return {...state, locations: action.locations};
  }
};

// helper function to make TypeScript recognize the proper types
function getActionHandler<T extends Action['type']>(
  action: Extract<Action, { type: T }>
): (state: State, action: Extract<Action, { type: T }>) => State {
  return actionHandler[action.type];
}

export function reducer(state: State, action: Action): State {
  const handler = getActionHandler(action);
  const newState = handler(state, action);
  // console.log("action:", action, newState);
  return newState;
}
