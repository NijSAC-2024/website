import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Activity, ActivityContent, Registration } from '../types.ts';
import { useAppState } from './AppStateProvider.tsx';
import { apiFetch } from '../api.ts';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from './AuthProvider.tsx';

interface ApiContextType {
  activities?: Activity[],
  activity?: Activity,
  registrations?: Registration[],
  updateActivity: (id: string, activity: ActivityContent) => Promise<void>,
  createActivity: (activity: ActivityContent) => Promise<void>,
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const { route } = useAppState();
  const { isLoggedIn } = useAuth();
  // We use this boolean to invalidate cached API calls whenever an item gets updated.
  // The `useEffects` depend on the boolean to trigger a reload on any change
  const [cache, setCache] = useState<boolean>(false);
  const [activities, setActivities] = useState<Array<Activity>>([]);
  const [activity, setActivity] = useState<Activity | undefined>(undefined);
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);

  const updateActivity = async (id: string, activity: ActivityContent) => {
    const { error, data: updatedActivity } = await apiFetch<Activity>(`/activity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activity)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    setActivity(updatedActivity);
    setCache(!cache);
    enqueueSnackbar('saved', {
      variant: 'success'
    });
  };

  const createActivity = async (activity: ActivityContent) => {
    const { error, data: updatedActivity } = await apiFetch<Activity>('/activity', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    setActivity(updatedActivity);
    setCache(!cache);
    enqueueSnackbar('saved', {
      variant: 'success'
    });
  };

  useEffect(() => {
    if (route.name === 'agenda') {
      apiFetch<Array<Activity>>('/activity').then(
        ({ error, data: activities }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error'
            });
          }
          if (activities) {
            setActivities(activities);
          }
        }
      );
    }
  }, [cache, route.name]);

  useEffect(() => {
    if (route.name === 'activity') {
      apiFetch<Activity>(`/activity/${route.params!.id}`).then(
        ({ error, data: activity }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error'
            });
          }
          if (activity) {
            setActivity(activity);
          }
        }
      );
      if (isLoggedIn) {
        apiFetch<Array<Registration>>(`/activity/${route.params!.id}/registration`).then(
          ({ error, data: registrations }) => {
            if (error) {
              enqueueSnackbar(`${error.message}: ${error.reference}`, {
                variant: 'error'
              });
            }
            if (registrations) {
              setRegistrations(registrations);
            }
          }
        );
      }

    }
  }, [cache, route.name, route.params, isLoggedIn]);

  return (
    <ApiContext.Provider value={{ activities, activity, registrations, updateActivity, createActivity }}>
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
