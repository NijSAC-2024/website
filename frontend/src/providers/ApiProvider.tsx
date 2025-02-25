import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Activity } from '../types.ts';
import { useAppState } from './AppStateProvider.tsx';
import { apiFetch } from '../api.ts';
import { enqueueSnackbar } from 'notistack';

interface ApiContextType {
  activities?: Activity[],
  activity?: Activity,
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const { route } = useAppState();
  const [activities, setActivities] = useState<Array<Activity>>([]);
  const [activity, setActivity] = useState<Activity|undefined>(undefined);
  console.log('create API provider, route name: ', route.name);

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
  }, [route.name]);

  useEffect(() => {
    if (route.name === 'activity') {
      apiFetch<Activity>(`/activity/${route.params!.id}`).then(
        ({ error, data: activity }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error'
            });
          }
          if (activities) {
            setActivity(activity);
          }
        }
      );
    }
  }, [route.name]);

  return (
    <ApiContext.Provider value={{ activities, activity }}>
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
