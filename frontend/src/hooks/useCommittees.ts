import {useSelector} from './useSelector.ts';
import {WebsiteError} from '../error/error.ts';

export function useCommittees() {
  const routerState = useSelector((state) => state.routerState);

  const myCommittees = useSelector((state) => state.myCommittees || []);
  const committees = useSelector((state) => state.committees || []);
  const committeeMembers = useSelector((state) => state.committeeMembers || []);

  const committee = committees.find((c) => c.id === routerState.params.committee_id) || null;

  if (!committee && routerState.params.committee_id) {
    throw new WebsiteError(`Could not find committee with ID ${routerState.params.committee_id}`, 404);
  }

  return {myCommittees, committees, committee, committeeMembers};
}