import {useSelector} from './useSelector.ts';
import {WebsiteError} from '../error/error.ts';
import {BasicUser, Committee, CommitteeContent} from '../types.ts';
import {apiFetch, apiFetchVoid} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useWebsite} from './useState.ts';

export function useCommittees() {
  const {text} = useLanguage();
  const {dispatch} = useWebsite();
  const routerState = useSelector((state) => state.routerState);

  const myCommittees = useSelector((state) => state.myCommittees || []);
  const committees = useSelector((state) => state.committees || []);
  const committeeMembers = useSelector((state) => state.committeeMembers || []);

  const committee = committees.find((c) => c.id === routerState.params.committee_id) || null;

  if (!committee && routerState.params.committee_id) {
    throw new WebsiteError(`Could not find committee with ID ${routerState.params.committee_id}`, 404);
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
    enqueueSnackbar(text('Committee created', 'Committee aangemaakt'), {variant: 'success'});
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
    enqueueSnackbar(text('Committee updated', 'Committee bijgewerkt'), {variant: 'success'});
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
    enqueueSnackbar(text('Committee deleted', 'Committee verwijderd'), {variant: 'success'});
  };

  const addUserToCommittee = async (committeeId: string, userId: string): Promise<boolean> => {
    const {data, error} = await apiFetch<BasicUser>(`/committee/${committeeId}/user/${userId}`, {
      method: 'POST',
    });
    if (error) {
      enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
      return false;
    }
    dispatch({type: 'add_committee_member', user: data, committeeId, role: 'member'});
    enqueueSnackbar(text('User added to committee', 'Gebruiker an committee toevoegt'), {variant: 'success'});
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
    enqueueSnackbar(text('User removed from committee', 'Gebruiker uit committee gehaald'), {variant: 'success'});
    return true;
  };

  return {
    myCommittees,
    committees,
    committee,
    committeeMembers,
    createCommittee,
    updateCommittee,
    deleteCommittee,
    addUserToCommittee,
    deleteUserFromCommittee
  };
}