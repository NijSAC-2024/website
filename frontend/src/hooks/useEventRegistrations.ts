import {useContext} from 'react';
import {useWebsite, WebsiteContext} from './useState.ts';
import {apiFetch, apiFetchVoid} from '../api.ts';
import {Answer, Registration} from '../types.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';

export function useEventRegistrations() {
  const {state} = useContext(WebsiteContext);
  const {text} = useLanguage();
  const {dispatch} = useWebsite();

  const createRegistration = async (eventId: string, userId: string | null, answers: Answer[]) => {
    const {data, error} = await apiFetch<Registration>(`/event/${eventId}/registration`, {
      method: 'POST',
      body: JSON.stringify({userId: userId, answers})
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'add_event_registration', registration: data});
    enqueueSnackbar(text('Registered', 'Ingeschreven'), {variant: 'success'});
  };

  const updateRegistration = async (eventId: string, registrationId: string, answers: Answer[], attended?: boolean, waitingListPosition?: number) => {
    const {data, error} = await apiFetch<Registration>(`/event/${eventId}/registration/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify({answers: answers, attended: attended, waitingListPosition: waitingListPosition})
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'delete_event_registration', registrationId: registrationId, eventId});
    dispatch({type: 'add_event_registration', registration: data});
    enqueueSnackbar(text('Registration updated', 'Inschrijving bijgewerkt'), {variant: 'success'});
  };

  const deleteRegistration = async (eventId: string, registrationId: string) => {
    const {error} = await apiFetchVoid(`/event/${eventId}/registration/${registrationId}`, {
      method: 'DELETE'
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'delete_event_registration', registrationId: registrationId, eventId});
    enqueueSnackbar(text('Deregistered', 'Uitgeschreven'), {variant: 'success'});
  };

  return {
    eventRegistrations: state.registrations,
    userEventRegistrations: state.userEventRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration
  };
}