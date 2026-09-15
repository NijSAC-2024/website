import {useState} from 'react';
import {Switch} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider';
import ContentCard from '../ContentCard';
import EventCard from '../event/EventCard';
import {Event} from '../../types.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useParams} from 'react-router-dom';
import {useAuth} from '../../providers/AuthProvider.tsx';

export default function UserRegistrations() {
  const {text} = useLanguage();
  const {userId} = useParams();
  const {useUserEvents} = useUserHook();
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);
  const userEvents = useUserEvents(userId, filterPastEvents)
  const {user} = useAuth()

  if (!user) {
    return null;
  }
  const isMe = userId === user.id;

  return (
    <>
      <ContentCard className="mt-5">
        <div className="grid xl:grid-cols-2 justify-between">
          <h1>{isMe ? text('My registrations', 'Mijn inschrijvingen') : text('Registrations', 'Inschrijvingen')}</h1>
          <div className="flex items-center xl:justify-end">
            <p>{text('Include past events', 'Plaatsgevonden evenementen meenemen')}</p>
            <Switch
              checked={filterPastEvents}
              onChange={(_, checked) => setFilterPastEvents(checked)}
            />
          </div>
        </div>
      </ContentCard>

      {userEvents && userEvents.length > 0 && (
        <div className="grid xl:grid-cols-3 gap-5 mt-5">
          {
            (userEvents as unknown as Event[]).map((event: Event) => (
              <EventCard
                key={event.id}
                event={event}
                agendaPage={true}
              />
            ))
          }
        </div>
      )}
    </>
  );
}
