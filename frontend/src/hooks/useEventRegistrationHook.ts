import {apiFetch} from '../api.ts';
import {Answer, Registration} from '../types.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {ApiError} from '../error/error.ts';
import {useAuth} from '../providers/AuthProvider.tsx';

export function useEventRegistrationHook() {
  const {text} = useLanguage();
  const queryClient = useQueryClient();
  const {user} = useAuth();

  function useEventRegistrations(eventId?: string) {
    const {data} = useQuery<Registration[]>({
      queryKey: queryKeys.events.registrations(eventId),
      enabled: !!eventId,
      queryFn: () =>
        apiFetch<Registration[]>(
          `/event/${eventId}/registration`
        ),
      placeholderData: (prev) => prev,
      staleTime: 60_000,
    });
    return data;
  }

  const createRegistrationMutation = useMutation<
    Registration,
    ApiError,
    {
      eventId: string;
      answers: Answer[];
      userId?: string;
      guestName?: string,
      guestEmail?: string
    }
  >({
    mutationFn: async ({eventId, answers, userId, guestName, guestEmail}) => {
      return apiFetch<Registration>(
        `/event/${eventId}/registration`,
        {
          method: 'POST',
          body: JSON.stringify({guestName, guestEmail, userId, answers}),
        }
      );
    },
    onSuccess: (_, {eventId, userId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
      queryClient.invalidateQueries({queryKey: queryKeys.events.detail(eventId)});
      if (userId) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(userId)});
      }
      enqueueSnackbar(text('Registered', 'Ingeschreven'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const createRegistration = (
    eventId: string,
    answers: Answer[],
    userId?: string,
    guestName?: string,
    guestEmail?: string
  ) =>
    createRegistrationMutation.mutateAsync({
      eventId,
      answers,
      userId,
      guestName,
      guestEmail,
    });

  const updateRegistrationMutation = useMutation<
    Registration,
    ApiError,
    {
      eventId: string;
      registrationId: string;
      guestName?: string;
      guestEmail?: string;
      answers: Answer[];
      waitingListPosition?: number;
    }
  >({
    mutationFn: async ({
      eventId,
      registrationId,
      guestName,
      guestEmail,
      answers,
      waitingListPosition,
    }) => {
      return await apiFetch<Registration>(
        `/event/${eventId}/registration/${registrationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            guestName,
            guestEmail,
            answers,
            waitingListPosition,
          }),
        }
      );
    },

    onSuccess: (_, {eventId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
      queryClient.invalidateQueries({queryKey: queryKeys.events.detail(eventId)});
      if (user?.id) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(user.id)});
      }
      enqueueSnackbar(text('Registration updated', 'Inschrijving bijgewerkt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const updateRegistration = (
    eventId: string,
    registrationId: string,
    answers: Answer[],
    waitingListPosition?: number,
    guestName?: string,
    guestEmail?: string
  ) =>
    updateRegistrationMutation.mutateAsync({
      eventId,
      registrationId,
      guestName,
      guestEmail,
      answers,
      waitingListPosition,
    });

  const updateAttendanceMutation = useMutation<
    void,
    ApiError,
    {
      eventId: string;
      registrationId: string;
    }
  >({
    mutationFn: async ({eventId, registrationId}) => {
      return await apiFetch<void>(
        `/event/${eventId}/registration/${registrationId}/attendance`,
        {
          method: 'PATCH',
        }
      );
    },
    onSuccess: (_, {eventId}) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.registrations(eventId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(eventId),
      });

      enqueueSnackbar(
        text('Attendance updated', 'Aanwezigheid bijgewerkt'),
        {variant: 'success'}
      );
    },
    onError: (error: ApiError) =>
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      }),
  });

  const updateAttendance = (
    eventId: string,
    registrationId: string,
  ) =>
    updateAttendanceMutation.mutateAsync({
      eventId,
      registrationId,
    });

  const deleteRegistrationMutation = useMutation<
    void,
    ApiError,
    { eventId: string; userId?: string; registrationId: string }
  >({
    mutationFn: async ({eventId, registrationId}) => {
      await apiFetch<void>(
        `/event/${eventId}/registration/${registrationId}`,
        {
          method: 'DELETE',
        }
      );
    },
    onSuccess: (_, {eventId, userId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
      queryClient.invalidateQueries({queryKey: queryKeys.events.detail(eventId)});
      if (userId) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(userId)});
      } else if (user?.id) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(user.id)});
      }
      enqueueSnackbar(text('Deregistered', 'Uitgeschreven'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const deleteRegistration = (
    eventId: string,
    registrationId: string,
    userId?: string
  ) =>
    deleteRegistrationMutation.mutateAsync({
      eventId,
      userId,
      registrationId,
    });

  return {
    useEventRegistrations,
    createRegistration,
    updateRegistration,
    updateAttendance,
    deleteRegistration,
  };
}
