import {Event, EventContent} from '../types.ts';
import {ApiError, apiFetch, apiFetchVoid} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';

export function useEventHook() {
  const {text} = useLanguage();
  const queryClient = useQueryClient();

  function useEvents() {
    const {data} = useQuery<Event[]>({
      queryKey: queryKeys.events.all(),
      queryFn: () => apiFetch<Event[]>('/event'),
      staleTime: 60_000,
    });
    return data;
  }

  function useEvent(eventId?: string) {
    const {data} = useQuery<Event>({
      queryKey: queryKeys.events.detail(eventId),
      enabled: !!eventId,
      queryFn: () =>
        apiFetch<Event>(`/event/${eventId}`),
      staleTime: 60_000,
    });
    return data;
  }

  const createEventMutation = useMutation<
    Event,
    ApiError,
    { content: EventContent }
  >({
    mutationFn: async ({content}) => {
      return await apiFetch<Event>('/event', {
        method: 'POST',
        body: JSON.stringify(content),
      });
    },
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      queryClient.invalidateQueries({queryKey: queryKeys.events.all()});
      enqueueSnackbar(text('Event created', 'Evenement aangemaakt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const createEvent = (content: EventContent) =>
    createEventMutation.mutateAsync({content});

  const updateEventMutation = useMutation<
    Event,
    ApiError,
    {eventId: string; content: EventContent}
  >({
    mutationFn: async ({eventId, content}) => {
      return await apiFetch<Event>(
        `/event/${eventId}`,
        {
          method: 'PUT',
          body: JSON.stringify(content),
        }
      );
    },
    onSuccess: (event, {eventId}) => {
      queryClient.setQueryData(queryKeys.events.detail(eventId), event);
      queryClient.invalidateQueries({queryKey: queryKeys.events.all()});
      enqueueSnackbar(text('Event updated', 'Evenement bijgewerkt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const updateEvent = (eventId: string, content: EventContent) =>
    updateEventMutation.mutateAsync({ eventId, content });

  const deleteEventMutation = useMutation<
    void,
    ApiError,
    {eventId: string}
  >({
    mutationFn: async ({eventId}) => {
      await apiFetchVoid(`/event/${eventId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, {eventId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.events.all()});
      queryClient.removeQueries({queryKey: queryKeys.events.detail(eventId)});
      queryClient.removeQueries({queryKey: queryKeys.events.registrations(eventId)});
      enqueueSnackbar(text('Event deleted', 'Evenement verwijderd'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const deleteEvent = (eventId: string) =>
    deleteEventMutation.mutateAsync({ eventId });

  return {
    useEvent,
    useEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}