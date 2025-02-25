import { createContext, useState } from 'react';
import { matchName, paramsToPath, parseLocation } from '../router.ts';
import { Activity, ActivityContent, Route, State } from '../types.ts';
import { apiFetch, apiFetchVoid } from '../api.ts';
import { enqueueSnackbar } from 'notistack';
import { text } from '../util.ts';

let route: Route;
try {
  route = parseLocation(window.location);
} catch (error) {
  console.log(error);
}

export interface InternalState {
  state: State;
  login: (email: string, password: string, onSuccess: () => void) => void;
  updateActivity: (content: ActivityContent, id: string) => void;
  createActivity: (content: ActivityContent) => void;
  navigate: (routeName: string, params?: Record<string, string>) => void;
}

function defaultInternalState(): InternalState {
  return {
    state: { version: 'development', route },
    login: () => console.log('A fatal error occurred'),
    updateActivity: () => console.log('A fatal error occurred'),
    createActivity: () => console.log('A fatal error occurred'),
    navigate: () => console.log('A fatal error occurred')
  };
}


export const StateContext = createContext<InternalState>(defaultInternalState());


export default function useInternalState(): InternalState {
  const [state, setState] = useState<State>({ version: 'development', route });

  const navigate = (routeName: string, params?: Record<string, string>) => {
    const route = matchName(routeName);
    if (!route) {
      throw Error('Unknown route: ' + routeName);
    }

    const current = window.location.pathname;
    route.params = params;

    paramsToPath(route, params);
    if (current !== route.path) {
      history.pushState({ route }, '', route.path);
    }

    setState({ ...state, route });
  };

  const updateActivity = (content: ActivityContent, id: string) => {
    apiFetch<Activity>(`/activity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content)
    }).then(({ error, data: activity }) => {
      if (error) {
        enqueueSnackbar(`${error.message}: ${error.reference}`, {
          variant: 'error'
        });
      }
      setState({ ...state, activities: undefined, activity });
      enqueueSnackbar(text('Activity saved', 'Evenement opgeslagen'), { variant: 'success' });
    });
  };

  const createActivity = (content: ActivityContent) => {
    apiFetch<Activity>('/activity', {
      method: 'POST',
      body: JSON.stringify(content)
    }).then(({ error, data: activity }) => {
      if (error) {
        enqueueSnackbar(`${error.message}: ${error.reference}`, {
          variant: 'error'
        });
      }
      setState({ ...state, activities: undefined, activity });
      enqueueSnackbar(text('Activity saved', 'Evenement opgeslagen'), { variant: 'success' });
    });
  };
  

  if (state.route.name === 'agenda' && !state.activities) {
    apiFetch<Array<Activity>>('/activity')
      .then(({ error, data: activities }) => {
        if (error) {
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error'
          });
        }

        setState({ ...state, activities });
      });
  }


  return {
    state,
    login,
    updateActivity,
    createActivity,
    navigate
  };
}