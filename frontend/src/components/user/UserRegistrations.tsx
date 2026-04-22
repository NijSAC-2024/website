import {useState} from 'react';
import {Switch} from '@mui/material';
import moment from 'moment';
import {useLanguage} from '../../providers/LanguageProvider';
import ContentCard from '../ContentCard';
import EventCard from '../event/EventCard';
import {Event} from '../../types.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useParams} from 'react-router-dom';

export default function UserRegistrations() {
  const {text} = useLanguage();
  const params = useParams();
  const {useAuthUser, useUserEventRegistrations, useUserEvents} = useUserHook();
  const userEventRegistrations = useUserEventRegistrations(params.userId);
  const userEvents = useUserEvents(params.userId)
  const user = useAuthUser();
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);
  const now = new Date();

  if (!user || !userEventRegistrations) {
    return null;
  }
  const isMe = params.userId === user.id;

  const filteredEvents =
    (userEvents as unknown as Event[])?.filter((event) =>
      filterPastEvents ||
      moment(event.dates[0].start).isAfter(moment(now))
    ) ?? [];

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

      {filteredEvents.length > 0 && (
        <div className="grid xl:grid-cols-3 gap-5 mt-5">
          {
            filteredEvents.map((event: Event) => (
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
