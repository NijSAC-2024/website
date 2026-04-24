import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {apiFetch} from '../api.ts';
import {Registration, User, UserCommittee, UserContent} from '../types.ts';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {ApiError} from '../error/error.ts';
import {useAuth} from '../providers/AuthProvider.tsx';

export function useUserHook() {
  const {text} = useLanguage();
  const queryClient = useQueryClient();
  const {user} = useAuth();

  function useUsers() {
    const {data} = useQuery<User[]>({
      queryKey: queryKeys.users.all(),
      enabled: !!user,
      queryFn: () => apiFetch<User[]>('/user'),
      staleTime: 60_000,
    });
    return data;
  }

  function useUser(userId?: string) {
    const {data} = useQuery<User>({
      queryKey: queryKeys.users.detail(userId),
      enabled: !!userId && !!user,
      queryFn: () =>
        apiFetch<User>(`/user/${userId}`),
      staleTime: 60_000,
    });
    return data;
  }

  function useUserCommittees(userId?: string) {
    const {data} = useQuery<UserCommittee[]>({
      queryKey: queryKeys.users.committees(userId),
      enabled: !!userId && !!user,
      queryFn: () =>
        apiFetch<UserCommittee[]>(`/user/${userId}/committees`),
      staleTime: 60_000,
    });
    return data;
  }

  function useUserEvents(userId?: string) {
    const {data} = useQuery<Event[]>({
      queryKey: queryKeys.users.events(userId),
      enabled: !!userId && !!user,
      queryFn: () =>
        apiFetch<Event[]>(`/user/${userId}/events`),
      staleTime: 60_000,
    });
    return data;
  }

  function useUserEventRegistrations(userId?: string) {
    const {data} = useQuery<Registration[]>({
      queryKey: queryKeys.users.registrations(userId),
      enabled: !!userId && !!user,
      queryFn: () =>
        apiFetch<Registration[]>(
          `/user/${userId}/event_registrations`
        ),
      staleTime: 60_000,
    });
    return data;
  }

  const loginMutation = useMutation<
    User,
    ApiError,
    {email: string; password: string}
  >({
    mutationFn: async ({email, password}) => {
      return await apiFetch<User>('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.user(), user);
      queryClient.invalidateQueries();
      enqueueSnackbar(text('You logged in', 'Je bent ingelogd'), {variant: 'success'});
    },
    onError: (error) => {
      if (error.message === 'Unauthorized') {
        enqueueSnackbar(
          text(
            'Incorrect email or password',
            'Ongeldig email of wachtwoord'
          ),
          {variant: 'error'}
        );
      } else {
        enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      }
    },
  });
  const login = (email: string, password: string) =>
    loginMutation.mutateAsync({ email, password });

  const logoutMutation = useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await apiFetch<void>('/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.user(), null);
      queryClient.clear();
      enqueueSnackbar(text('You logged out', 'Je bent uitgelogd'), {variant: 'success'});
    },
    onError: (error) => {enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})},
  });
  const logout = () => logoutMutation.mutateAsync();

  const signupMutation = useMutation<
    User,
    ApiError,
    { user: UserContent }
  >({
    mutationFn: async ({user}) => {
      const payload = {
        ...user,
        nkbvNumber: user.nkbvNumber.toString(),
        studentNumber: user.studentNumber.toString(),
        sportcardNumber: user.sportcardNumber.toString(),
      };
      return await apiFetch<User>('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({queryKey: queryKeys.auth.user()});
      enqueueSnackbar(`Created account: ${user.firstName} ${user.lastName}`, {variant: 'success'});
    },
    onError: (error) => {
      if (error.message === 'Conflict') {
        enqueueSnackbar(text('Email is already in use', 'E-mail is al in gebruik'), {variant: 'error'});
      } else {
        enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      }
    },
  });
  const signup = (user: UserContent) =>
    signupMutation.mutateAsync({user});

  const updateUserMutation = useMutation<
    User,
    ApiError,
    {userId: string; user: Omit<UserContent, 'password'>}
  >({
    mutationFn: async ({userId, user}) => {
      return await apiFetch<User>(`/user/${userId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(user),
      });
    },
    onSuccess: (_, {userId}) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      });

      enqueueSnackbar('Updated user', {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const updateUser = (userId: string, user: Omit<UserContent, 'password'>) =>
    updateUserMutation.mutateAsync({ userId, user });

  const updateUserPasswordMutation = useMutation<
    User,
    ApiError,
    {userId: string; password: string}
  >({
    mutationFn: async ({userId, password}) => {
      return await apiFetch<User>(
        `/user/${userId}/password`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({password: password}),
        }
      );
    },
    onSuccess: () => {
      enqueueSnackbar('Updated password', {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const updateUserPassword = (
    userId: string,
    password: string
  ) =>
    updateUserPasswordMutation.mutateAsync({
      userId,
      password,
    });

  return {
    useUser,
    useUsers,
    useUserCommittees,
    useUserEvents,
    useUserEventRegistrations,
    login,
    logout,
    signup,
    updateUser,
    updateUserPassword,
  };
}