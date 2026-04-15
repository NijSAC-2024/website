import {apiFetch, apiFetchVoid} from '../api.ts';
import {Answer, Registration} from '../types.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store.ts';

export function useEventRegistrations() {
  const dispatch = useDispatch();
  const {text} = useLanguage();
  const queryClient = useQueryClient();

  const user = useSelector((s: RootState) => s.user);
  const registrations = useSelector((s: RootState) => s.registrations);
  const userEventRegistrations = useSelector((s: RootState) => s.userEventRegistrations);

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
    void queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
    if (user?.id) {
      void queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(user.id)});
    }
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
    void queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
    if (user?.id) {
      void queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(user.id)});
    }
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
    void queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
    if (user?.id) {
      void queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(user.id)});
    }
    enqueueSnackbar(text('Deregistered', 'Uitgeschreven'), {variant: 'success'});
  };

  return {
    eventRegistrations: registrations,
    userEventRegistrations: userEventRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration
  };
}
