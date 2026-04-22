import {BasicUser, Committee, CommitteeContent, CommitteeUser,} from '../types.ts';
import {ApiError, apiFetch, apiFetchVoid} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useMutation, useQuery, useQueryClient,} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';

export function useCommitteeHook() {
  const {text} = useLanguage();
  const queryClient = useQueryClient();

  function useCommittee(committeeId?: string) {
    const {data} = useQuery<Committee>({
      queryKey: queryKeys.committees.detail(committeeId),
      enabled: !!committeeId,
      queryFn: () => apiFetch<Committee>(`/committee/${committeeId}`),
      staleTime: 60_000,
    });
    return data;
  }

  function useCommittees() {
    const {data} = useQuery<Committee[]>({
      queryKey: queryKeys.committees.all(),
      queryFn: () => apiFetch<Committee[]>('/committee'),
      staleTime: 60_000,
    });
    return data;
  }

  function useCommitteeMembers(committeeId?: string) {
    const {data} = useQuery<CommitteeUser[]>({
      queryKey: queryKeys.committees.members(committeeId),
      enabled: !!committeeId,
      queryFn: () =>
        apiFetch<CommitteeUser[]>(`/committee/${committeeId}/members`),
      staleTime: 60_000,
    });
    return data;
  }

  const createCommitteeMutation = useMutation<
    Committee,
    ApiError,
    { content: CommitteeContent }
  >({
    mutationFn: async ({content}) => {
      return await apiFetch<Committee>('/committee', {
        method: 'POST',
        body: JSON.stringify(content),
      });
    },
    onSuccess: (committee) => {
      queryClient.setQueryData(queryKeys.committees.detail(committee.id), committee);
      queryClient.invalidateQueries({queryKey: queryKeys.committees.all()});
      enqueueSnackbar(text('Committee created', 'Commissie aangemaakt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const createCommittee = (content: CommitteeContent) =>
    createCommitteeMutation.mutateAsync({content});

  const updateCommitteeMutation = useMutation<
    Committee,
    ApiError,
    {committeeId: string; content: CommitteeContent}
  >({
    mutationFn: async ({committeeId, content}) => {
      return await apiFetch<Committee>(
        `/committee/${committeeId}`,
        {
          method: 'PUT',
          body: JSON.stringify(content),
        }
      );
    },
    onSuccess: (committee, {committeeId}) => {
      queryClient.setQueryData(queryKeys.committees.detail(committeeId), committee);
      queryClient.invalidateQueries({queryKey: queryKeys.committees.all()});
      enqueueSnackbar(text('Committee updated', 'Commissie bijgewerkt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const updateCommittee = (committeeId: string, content: CommitteeContent) =>
    updateCommitteeMutation.mutateAsync({ committeeId, content });

  const deleteCommitteeMutation = useMutation<
    void,
    ApiError,
    { committeeId: string }
  >({
    mutationFn: async ({committeeId}) => {
      await apiFetchVoid(`/committee/${committeeId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, {committeeId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.committees.all()});
      queryClient.removeQueries({queryKey: queryKeys.committees.detail(committeeId)});
      queryClient.removeQueries({queryKey: queryKeys.committees.members(committeeId)});
      enqueueSnackbar(text('Committee deleted', 'Commissie verwijderd'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const deleteCommittee = (committeeId: string) =>
    deleteCommitteeMutation.mutateAsync({ committeeId });

  const addUserToCommitteeMutation = useMutation<
    void,
    ApiError,
    {committeeId: string; userId: string}
  >({
    mutationFn: async ({committeeId, userId}) => {
      await apiFetch<BasicUser>(
        `/committee/${committeeId}/user/${userId}`,
        {method: 'POST'}
      );
    },
    onSuccess: (_, {committeeId, userId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.committees.members(committeeId)});
      if (userId) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.committees(userId)});
      }
      enqueueSnackbar(text('User added to committee', 'Gebruiker aan commissie toegevoegd'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const addUserToCommittee = (committeeId: string, userId: string) =>
    addUserToCommitteeMutation.mutateAsync({ committeeId, userId });

  const deleteUserFromCommitteeMutation = useMutation<
    void,
    ApiError,
    {committeeId: string; userId: string}
  >({
    mutationFn: async ({committeeId, userId}) => {
      await apiFetchVoid(
        `/committee/${committeeId}/user/${userId}`,
        {method: 'DELETE'}
      );
    },
    onSuccess: (_, {committeeId, userId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.committees.members(committeeId)});
      queryClient.invalidateQueries({queryKey: queryKeys.users.committees(userId)});
      enqueueSnackbar(
        text(
          'User removed from committee',
          'Gebruiker uit committee verwijderd'
        ),
        {variant: 'success'}
      );
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const deleteUserFromCommittee = (committeeId: string, userId: string) =>
    deleteUserFromCommitteeMutation.mutateAsync({ committeeId, userId });

  const makeChairMutation = useMutation<
    void,
    ApiError,
    {committeeId: string; userId: string}
  >({
    mutationFn: async ({committeeId, userId}) => {
      await apiFetchVoid(
        `/committee/${committeeId}/user/${userId}/chair`,
        {method: 'POST'}
      );
    },
    onSuccess: (_, {committeeId, userId}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.committees.members(committeeId)});
      if (userId) {
        queryClient.invalidateQueries({queryKey: queryKeys.users.committees(userId)});
      }
      enqueueSnackbar(text('Chair updated', 'Hoofd bijgewerkt'), {variant: 'success'});
    },
    onError: (error: ApiError) => enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'})
  });
  const makeChair = (committeeId: string, userId: string) =>
    makeChairMutation.mutateAsync({ committeeId, userId });

  return {
    useCommittee,
    useCommittees,
    useCommitteeMembers,
    createCommittee,
    updateCommittee,
    deleteCommittee,
    addUserToCommittee,
    deleteUserFromCommittee,
    makeChair,
  };
}