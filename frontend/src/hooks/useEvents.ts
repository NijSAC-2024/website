import {Event, EventContent} from '../types.ts';
import {apiFetch, apiFetchVoid} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store.ts';
import {useParams} from 'react-router-dom';

export function useEvents() {
  const dispatch = useDispatch();
  const {text} = useLanguage();
  const queryClient = useQueryClient();
  const events = useSelector((state: RootState) => state.events || []);
  const params = useParams();
  const currentEvent = events.find((o) => o.id === params.event_id) || null;

  const createEvent = async (content: EventContent): Promise<boolean> => {
    const {error, data: event} = await apiFetch<Event>('/event', {
      method: 'POST',
      body: JSON.stringify(content)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    }
    dispatch({type: 'add_event', event});
    void queryClient.invalidateQueries({queryKey: queryKeys.events.all()});
    enqueueSnackbar(text('Event created', 'Evenement aangemaakt'), {variant: 'success'});
    return true;
  };

  const updateEvent = async (eventId: string, content: EventContent): Promise<boolean> => {
    const {error, data: event} = await apiFetch<Event>(`/event/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(content)
      }
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    }
    dispatch({type: 'delete_event', eventId});
    dispatch({type: 'add_event', event});
    void queryClient.invalidateQueries({queryKey: queryKeys.events.all()});
    void queryClient.invalidateQueries({queryKey: queryKeys.events.detail(eventId)});
    enqueueSnackbar(text('Event updated', 'Evenement bijgewerkt'), {variant: 'success'});
    return true;
  };

  const deleteEvent = async (eventId: string) => {
    const {error} = await apiFetchVoid(`/event/${eventId}`, {
      method: 'DELETE'
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'delete_event', eventId});
    void queryClient.invalidateQueries({queryKey: queryKeys.events.all()});
    void queryClient.removeQueries({queryKey: queryKeys.events.detail(eventId)});
    void queryClient.removeQueries({queryKey: queryKeys.events.registrations(eventId)});
    enqueueSnackbar(text('Event deleted', 'Evenement verwijderd'), {variant: 'success'});
  };

  return {events, currentEvent, createEvent, updateEvent, deleteEvent};
}
