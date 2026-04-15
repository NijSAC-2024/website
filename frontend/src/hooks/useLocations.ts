import {useSelector} from './useSelector.ts';
import {Location, LocationContent} from '../types.ts';
import {apiFetch} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useWebsite} from './useState.ts';

export function useLocations() {
  const {text} = useLanguage();
  const {dispatch} = useWebsite();
  const locations = useSelector((state) => state.locations || []);

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
    enqueueSnackbar(text('Location created', 'Locatie aangemaakt'), {variant: 'success'});
    return location;
  };

  return {locations, createLocation};
}
