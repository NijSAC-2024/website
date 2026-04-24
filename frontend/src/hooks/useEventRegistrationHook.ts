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
      enabled: !!eventId && !!user,
      queryFn: () =>
        apiFetch<Registration[]>(
          `/event/${eventId}/registration`
        ),
      staleTime: 60_000,
    });
    return data;
  }

  const createRegistrationMutation = useMutation<
    Registration,
    ApiError,
    { eventId: string; userId: string | null; answers: Answer[] }
  >({
    mutationFn: async ({ eventId, userId, answers }) => {
      return apiFetch<Registration>(
        `/event/${eventId}/registration`,
        {
          method: 'POST',
          body: JSON.stringify({ userId, answers }),
        }
      );
    },
    onSuccess: (_, { eventId, userId }) => {
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
    userId: string | null,
    answers: Answer[]
  ) =>
    createRegistrationMutation.mutateAsync({
      eventId,
      userId,
      answers,
    });

  const updateRegistrationMutation = useMutation<
    Registration,
    ApiError,
    {
      eventId: string;
      registrationId: string;
      answers: Answer[];
      attended?: boolean;
      waitingListPosition?: number;
    }
  >({
    mutationFn: async ({
      eventId,
      registrationId,
      answers,
      attended,
      waitingListPosition,
    }) => {
      return await apiFetch<Registration>(
        `/event/${eventId}/registration/${registrationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            answers,
            attended,
            waitingListPosition,
          }),
        }
      );
    },

    onSuccess: (_, { eventId, registrationId }) => {
      queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
      queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(registrationId)});
      enqueueSnackbar(text('Registration updated', 'Inschrijving bijgewerkt'), { variant: 'success' });
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const updateRegistration = (
    eventId: string,
    registrationId: string,
    answers: Answer[],
    attended?: boolean,
    waitingListPosition?: number
  ) =>
    updateRegistrationMutation.mutateAsync({
      eventId,
      registrationId,
      answers,
      attended,
      waitingListPosition,
    });

  const deleteRegistrationMutation = useMutation<
    void,
    ApiError,
    { eventId: string; userId?: string; registrationId: string }
  >({
    mutationFn: async ({ eventId, registrationId }) => {
      await apiFetch<void>(
        `/event/${eventId}/registration/${registrationId}`,
        {
          method: 'DELETE',
        }
      );
    },
    onSuccess: (_, { eventId, userId, registrationId }) => {
      queryClient.invalidateQueries({queryKey: queryKeys.events.registrations(eventId)});
      queryClient.invalidateQueries({queryKey: queryKeys.events.detail(eventId)});
      queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(registrationId)});
      if (userId) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.registrations(userId)});
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
    deleteRegistration,
  };
}