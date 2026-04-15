import {Action, State, UserCommittee} from './types';

export const initialState: State = {
  currentUser: null,
  committeeMembers: [],
  committees: [],
  myCommittees: [],
  currentCommittees: [],
  users: [],
  locations: [],
  userEventRegistrations: [],
  user: null,
  events: [],
  registrations: [],
  version: 'dev',
  error: null
};

const actionHandler: {
  [action in Action['type']]: (state: State, action: Extract<Action, { type: action }>) => State;
} = {
  set_users: function (state, action) {
    return {...state, users: action.users};
  },
  add_user: function (state, action) {
    return {...state, users: [...state.users || [], action.user]};
  },
  delete_user: function (state, action) {
    return {...state, users: state.users?.filter(u => u.id !== action.userId) || []};
  },
  set_current_user: function (state, action) {
    return {...state, currentUser: action.user};
  },
  set_error: function (state, action) {
    return {...state, error: action.error};
  },
  set_events: function (state, action) {
    return {...state, events: action.events};
  },
  add_event: function (state, action) {
    return {...state, events: [...state.events || [], action.event]};
  },
  delete_event: function (state, action) {
    return {...state, events: state.events?.filter((e) => e.id !== action.eventId) || null};
  },
  set_event_registrations: function (state, action) {
    return {...state, registrations: action.registrations};
  },
  add_event_registration(state: State, action) {
    // Adopt registration count
    let events = state.events;
    const event = events?.find(e => e.id === action.registration.eventId);
    if (event && events) {
      event.registrationCount = (state.registrations?.length || 0) + 1;
      events = [...events.filter(e => e.id !== action.registration.eventId), event];
    }

    return {
      ...state,
      events,
      userEventRegistrations: state.user?.id === action.registration.id ? [...state.userEventRegistrations || [], action.registration] : state.userEventRegistrations,
      registrations: [...state.registrations || [], action.registration]
    };
  },
  delete_event_registration(state: State, action) {
    // Adopt registration count
    let events = state.events;
    const event = events?.find(e => e.id === action.eventId);
    if (event && events) {
      event.registrationCount = (state.registrations?.length || 0) - 1;
      events = [...events.filter(e => e.id !== action.eventId), event];
    }

    return {
      ...state,
      events,
      userEventRegistrations: state.userEventRegistrations?.filter((r) => r.id !== action.registrationId) || null,
      registrations: state.registrations?.filter((r) => r.id !== action.registrationId) || null
    };
  },
  set_user_event_registrations(state: State, action) {
    return {...state, userEventRegistrations: action.registrations};
  },
  set_my_committees(state: State, action) {
    return {...state, myCommittees: action.committees};
  },
  set_current_committees(state: State, action) {
    return {...state, currentCommittees: action.committees};
  },
  set_committees(state: State, action) {
    return {...state, committees: action.committees};
  },
  add_committee(state: State, action) {
    return {...state, committees: [...state.committees || [], action.committee]};
  },
  delete_committee(state: State, action) {
    return {...state, committees: state.committees?.filter(c => c.id !== action.committeeId) || null};
  },
  set_committee_members(state: State, action) {
    return {...state, committeeMembers: action.members};
  },
  add_committee_member(state: State, action) {
    const now = new Date().toISOString();
    const entry: UserCommittee = {
      committeeId: action.committeeId,
      joined: now,
      left: undefined,
      userId: state.currentUser?.id ?? '',
      role: 'member',
    };
    return {
      ...state,
      committeeMembers: [...(state.committeeMembers || []), {...action.user, role: 'member'}],
      currentCommittees: [...(state.currentCommittees || []), entry],
      myCommittees: state.currentUser?.id === state.user?.id ? [...(state.myCommittees || []), entry] : state.myCommittees,
    };
  },

  delete_committee_member(state: State, action) {
    const now = new Date().toISOString();
    return {
      ...state,
      committeeMembers: state.committeeMembers?.filter(m => m.id !== action.userId) || null,
      currentCommittees: state.currentCommittees?.map(c =>
        c.committeeId === action.committeeId && c.left === undefined
          ? {...c, left: now}
          : c
      ) || null,
      myCommittees: state.currentUser?.id === state.user?.id
        ? state.myCommittees?.map(c =>
          c.committeeId === action.committeeId && c.left === undefined
            ? {...c, left: now}
            : c
        ) || null
        : state.myCommittees,
    };
  },

  set_locations: function (state, action) {
    return {...state, locations: action.locations};
  },
  add_location: function (state, action) {
    return {...state, locations: [...state.locations || [], action.location]};
  },
  logout: function (state, _action) {
    return {
      ...state,
      user: null,
      currentUser: null,
      users: [],
      registrations: [],
      userEventRegistrations: [],
      myCommittees: [],
      currentCommittees: [],
      committeeMembers: [],
      forceReload: false
    };
  },
  login: function (state, action) {
    return {...state, user: action.user, forceReload: false};
  }
};

// helper function to make TypeScript recognize the proper types
function getActionHandler<T extends Action['type']>(
  action: Extract<Action, { type: T }>
) {
  return actionHandler[action.type];
}

export function reducer(state: State = initialState, action: Action): State {
  const handler = getActionHandler(action);

  if (!handler) {return state;}

  return handler(state, action as never);
}
