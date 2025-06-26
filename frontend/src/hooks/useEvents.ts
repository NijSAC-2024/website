import { useApiState } from '../providers/ApiProvider.tsx';
import { useAppState } from '../providers/AppStateProvider.tsx';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api.ts';
import { Answer, Event, EventContent, Registration, toEventContent } from '../types.ts';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';


export function useEvents() {
  const { events } = useApiState();
  const { route } = useAppState();
  const { isLoggedIn, user } = useAuth();
  const { text } = useLanguage();

  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);

  const updateEvent = async (eventId: string, event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>(
      `/event/${eventId}`,
      {
        method: 'PUT',
        body: JSON.stringify(event)
      }
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    setEvent(updatedEvent);
    enqueueSnackbar(text('Event updated', 'Evenement bijgewerkt'), {
      variant: 'success'
    });
  };

  const createEvent = async (event: EventContent) => {
    const { error, data: updatedEvent } = await apiFetch<Event>('/event', {
      method: 'POST',
      body: JSON.stringify(event)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    setEvent(updatedEvent);
    enqueueSnackbar(text('Event created', 'Evenement aangemaakt'), {
      variant: 'success'
    });
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await apiFetch(`/event/${eventId}`, {
      method: 'DELETE'
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    enqueueSnackbar(text('Event deleted', 'Evenement verwijderd'), {
      variant: 'success'
    });
  };

  const updateRegistration = async (eventId: string, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration/${user?.id}`, {
      method: 'PUT',
      body: JSON.stringify({ answers })
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }

    enqueueSnackbar(text('Registration updated', 'Inschrijving bijgewerkt'), {
      variant: 'success'
    });
  };


  const createRegistration = async (eventId: string, answers: Answer[]) => {
    const { error } = await apiFetch<Event>(`/event/${eventId}/registration/${user?.id}`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    enqueueSnackbar(text('Registered', 'Ingeschreven'), {
      variant: 'success'
    });
  };

  const deleteRegistration = async (eventId: string) => {
    const { error } = await apiFetch(`/event/${eventId}/registration/${user?.id}`, {
      method: 'DELETE'
    });

    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error'
      });
      return;
    }
    enqueueSnackbar(text('Deregistered', 'Uitgeschreven'), {
      variant: 'success'
    });
  };

  useEffect(() => {
    if (route.name === 'event' || route.name === 'edit_event') {
      apiFetch<Event>(`/event/${route.params!.id}`).then(
        ({ error, data: event }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error'
            });
          }
          if (event) {
            setEvent(event);
          }
        }
      );
      if (isLoggedIn) {
        apiFetch<Array<Registration>>(
          `/event/${route.params!.id}/registration`
        ).then(({ error, data: registrations }) => {
          if (error) {
            enqueueSnackbar(`${error.message}: ${error.reference}`, {
              variant: 'error'
            });
          }
          if (registrations) {
            setRegistrations(registrations);
          }
        });
      }
    } else {
      setRegistrations([]);
      setEvent(undefined);
    }
  }, [route.name, route.params, isLoggedIn]);

  let eventContent = null;
  if (event) {
    eventContent = toEventContent(event);
  }

  return {
    events,
    event,
    eventContent,
    registrations,
    updateEvent,
    createEvent,
    deleteEvent,
    updateRegistration,
    createRegistration,
    deleteRegistration
  };

}