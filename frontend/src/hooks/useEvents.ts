import {useSelector} from './useSelector.ts';
import {Event, EventContent} from '../types.ts';
import {apiFetch, apiFetchVoid} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useWebsite} from './useState.ts';

export function useEvents() {
  const {text} = useLanguage();
  const {dispatch} = useWebsite();
  const events = useSelector((state) => state.events || []);
  const routerState = useSelector((state) => state.routerState);
  const currentEvent = events.find((o) => o.id === routerState.params.event_id) || null;

  const createEvent = async (content: EventContent) => {
    const {error, data: event} = await apiFetch<Event>('/event', {
      method: 'POST',
      body: JSON.stringify(content)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'add_event', event});
    enqueueSnackbar(text('Event created', 'Evenement aangemaakt'), {variant: 'success'});
  };

  const updateEvent = async (eventId: string, content: EventContent) => {
    const {error, data: event} = await apiFetch<Event>(`/event/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(content)
      }
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'delete_event', eventId});
    dispatch({type: 'add_event', event});
    enqueueSnackbar(text('Event updated', 'Evenement bijgewerkt'), {variant: 'success'});
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await apiFetchVoid(`/event/${eventId}`, {
      method: 'DELETE'
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      return;
    }
    dispatch({type: 'delete_event', eventId});
    enqueueSnackbar(text('Event deleted', 'Evenement verwijderd'), { variant: 'success' });
  };

  return {events, currentEvent, createEvent, updateEvent, deleteEvent};
}