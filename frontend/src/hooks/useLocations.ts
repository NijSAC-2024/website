import {Location, LocationContent} from '../types.ts';
import {apiFetch} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store.ts';

export function useLocations() {
  const {text} = useLanguage();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const locations = useSelector((state: RootState) => state.locations || []);

  const createLocation = async (content: LocationContent): Promise<Location | null> => {
    const {error, data: location} = await apiFetch<Location>('/location', {
      method: 'POST',
      body: JSON.stringify(content)
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return null;
    }

    dispatch({type: 'add_location', location});
    void queryClient.invalidateQueries({queryKey: queryKeys.locations.all()});
    enqueueSnackbar(text('Location created', 'Locatie aangemaakt'), {variant: 'success'});
    return location;
  };

  return {locations, createLocation};
}
