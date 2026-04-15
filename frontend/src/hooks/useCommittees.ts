import {WebsiteError} from '../error/error.ts';
import {BasicUser, Committee, CommitteeContent, CommitteeRoleType} from '../types.ts';
import {apiFetch, apiFetchVoid} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store.ts';
import {useParams} from 'react-router-dom';

export function useCommittees() {
  const {text} = useLanguage();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const params = useParams();
  const myCommittees = useSelector((state: RootState) => state.myCommittees || []);
  const currentCommittees = useSelector((state: RootState) => state.currentCommittees || []);
  const committees = useSelector((state: RootState) => state.committees || []);
  const committeeMembers = useSelector((state: RootState) => state.committeeMembers || []);

  const committee = committees.find((c) => c.id === params.committee_id) || null;

  if (!committee && params.committee_id) {
    throw new WebsiteError(`Could not find committee with ID ${params.committee_id}`, 404);
  }

  const createCommittee = async (content: CommitteeContent) => {
    const {error, data: committee} = await apiFetch<Committee>('/committee', {
      method: 'POST',
      body: JSON.stringify(content)
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'add_committee', committee});
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.all()});
    enqueueSnackbar(text('Committee created', 'Commissie aangemaakt'), {variant: 'success'});
  };

  const updateCommittee = async (committeeId: string, content: CommitteeContent) => {
    const {error, data: committee} = await apiFetch<Committee>(`/committee/${committeeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(content)
      }
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'delete_committee', committeeId});
    dispatch({type: 'add_committee', committee});
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.all()});
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.detail(committeeId)});
    enqueueSnackbar(text('Committee updated', 'Commissie bijgewerkt'), {variant: 'success'});
  };

  const deleteCommittee = async (committeeId: string) => {
    const {error} = await apiFetchVoid(`/committee/${committeeId}`, {
      method: 'DELETE'
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return;
    }
    dispatch({type: 'delete_committee', committeeId});
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.all()});
    void queryClient.removeQueries({queryKey: queryKeys.committees.detail(committeeId)});
    void queryClient.removeQueries({queryKey: queryKeys.committees.members(committeeId)});
    enqueueSnackbar(text('Committee deleted', 'Commissie verwijderd'), {variant: 'success'});
  };

  const addUserToCommittee = async (committeeId: string, userId: string): Promise<boolean> => {
    const {data, error} = await apiFetch<BasicUser>(`/committee/${committeeId}/user/${userId}`, {
      method: 'POST',
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    }
    dispatch({type: 'add_committee_member', user: data, committeeId});
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.members(committeeId)});
    if (params.user_id) {
      void queryClient.invalidateQueries({queryKey: queryKeys.users.committees(params.user_id)});
    }
    enqueueSnackbar(text('User added to committee', 'Gebruiker aan commissie toegevoegd'), {variant: 'success'});
    return true;
  };

  const deleteUserFromCommittee = async (committeeId: string, userId: string): Promise<boolean> => {
    const {error} = await apiFetchVoid(`/committee/${committeeId}/user/${userId}`, {
      method: 'DELETE',
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    }
    dispatch({type: 'delete_committee_member', userId, committeeId});
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.members(committeeId)});
    void queryClient.invalidateQueries({queryKey: queryKeys.users.committees(userId)});
    enqueueSnackbar(text('User removed from committee', 'Gebruiker uit committee verwijderd'), {variant: 'success'});
    return true;
  };

  const makeChair = async (committeeId: string, userId: string): Promise<boolean> => {
    const {error} = await apiFetchVoid(
      `/committee/${committeeId}/user/${userId}/chair`,
      {method: 'POST'}
    );
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    }
    const now = new Date().toISOString();
    dispatch({
      type: 'set_committee_members',
      members: committeeMembers.map(m =>
        m.role === 'chair'
          ? {...m, role: 'member'}
          : m.id === userId
            ? {...m, role: 'chair'}
            : m
      ),
    });
    const oldChairId = committeeMembers.find(m => m.role === 'chair')?.id;
    dispatch({
      type: 'set_current_committees',
      committees: [
        ...(currentCommittees || []).map(c =>
          c.committeeId === committeeId && c.left == null && (c.userId === userId || c.userId === oldChairId)
            ? {...c, left: now}
            : c
        ),
        {committeeId, userId, role: 'chair' as CommitteeRoleType, joined: now},
        ...(oldChairId ? [{
          committeeId,
          userId: oldChairId,
          role: 'member' as CommitteeRoleType,
          joined: now
        }] : []),
      ],
    });
    void queryClient.invalidateQueries({queryKey: queryKeys.committees.members(committeeId)});
    if (userId) {
      void queryClient.invalidateQueries({queryKey: queryKeys.users.committees(userId)});
    }
    enqueueSnackbar(text('Chair updated', 'Hoofd bijgewerkt'), {variant: 'success'});
    return true;
  };

  return {
    myCommittees,
    currentCommittees,
    committees,
    committee,
    committeeMembers,
    createCommittee,
    updateCommittee,
    deleteCommittee,
    addUserToCommittee,
    deleteUserFromCommittee,
    makeChair
  };
}
