import {
  useAuthQuery,
  useCommitteeMembersQuery,
  useCommitteesQuery,
  useEventRegistrationsQuery,
  useEventsQuery,
  useLocationsQuery,
  useUserCommitteesQuery,
  useUserDetailQuery,
  useUserRegistrationsQuery,
  useUsersQuery,
} from '../queries.ts';

import { useSelector } from 'react-redux';
import { RootState } from '../store.ts';
import { useParams, useLocation, matchPath } from 'react-router-dom';

function canAccessMemberData(
  membership: string | undefined,
  status: string | undefined
) {
  return (
    status === 'accepted' &&
    (membership === 'member' || membership === 'affiliated')
  );
}

export default function AppDataLoader() {
  const params = useParams();
  const location = useLocation();

  const events = useSelector((s: RootState) => s.events);
  const user = useSelector((s: RootState) => s.user);

  const eventRoute = !!matchPath('/events/*', location.pathname);

  const locationRoute = !!matchPath('/location', location.pathname);
  const userRoute = !!matchPath('/user/*', location.pathname);
  const membersRoute = !!matchPath('/members', location.pathname);
  const committeeRoute = !!matchPath('/committees/:committee_id/*', location.pathname);

  const eventId = params.event_id;
  const userId = params.user_id;
  const committeeId = params.committee_id;

  const currentEvent =
    events?.find((event) => event.id === eventId) || null;

  const hasMemberDataAccess = canAccessMemberData(
    user?.membership,
    user?.status
  );

  // Base queries (always)
  useAuthQuery();
  useEventsQuery();
  useCommitteesQuery();

  // Conditional queries
  useLocationsQuery(eventRoute || locationRoute);

  useUsersQuery(hasMemberDataAccess && (eventRoute || membersRoute));

  useUserRegistrationsQuery(
    user?.id || '',
    Boolean(
      user?.id &&
      hasMemberDataAccess &&
      (eventRoute || userId === user.id)
    )
  );

  useUserCommitteesQuery(
    user?.id || '',
    'mine',
    Boolean(
      user?.id &&
      hasMemberDataAccess &&
      (eventRoute || userRoute)
    )
  );

  useUserDetailQuery(
    userId || '',
    Boolean(user?.id && userRoute && userId)
  );

  useUserCommitteesQuery(
    userId || '',
    'current',
    Boolean(
      user?.id &&
      userRoute &&
      user.status === 'accepted' &&
      userId
    )
  );

  useCommitteeMembersQuery(
    committeeId || '',
    Boolean(
      user?.id &&
      hasMemberDataAccess &&
      committeeRoute &&
      committeeId
    )
  );

  useEventRegistrationsQuery(
    eventId || '',
    Boolean(
      matchPath('/events/:event_id', location.pathname) &&
      eventId &&
      currentEvent &&
      (
        currentEvent.requiredMembership.includes('nonMember') ||
        (
          user &&
          user.status === 'accepted' &&
          currentEvent.requiredMembership.includes(user.membership)
        )
      )
    )
  );

  return null;
}