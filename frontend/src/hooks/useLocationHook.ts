import {Location, LocationContent} from '../types.ts';
import {apiFetch} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';

type ApiError = {
  message: string;
  reference: string;
};

export function useLocationHook() {
  const {text} = useLanguage();
  const queryClient = useQueryClient();

  function useLocations() {
    const {data} = useQuery<Location[]>({
      queryKey: queryKeys.locations.all(),
      queryFn: () => apiFetch<Location[]>('/location'),
      staleTime: 60_000,
    });
    return data;
  }

  const createLocationMutation = useMutation<
    Location,
    ApiError,
    { content: LocationContent }
  >({
    mutationFn: async ({content}) => {
      return await apiFetch<Location>('/location', {
        method: 'POST',
        body: JSON.stringify(content),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.locations.all()});
      enqueueSnackbar(text('Location created', 'Locatie aangemaakt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const createLocation = (content: LocationContent) =>
    createLocationMutation.mutateAsync({content});

  return {
    useLocations,
    createLocation,
  };
}