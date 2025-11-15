import {useEffect, useState} from 'react';
import {Switch} from '@mui/material';
import moment from 'moment';
import {useLanguage} from '../../providers/LanguageProvider';
import ContentCard from '../ContentCard';
import EventCard from '../event/EventCard';
import {Event} from '../../types.ts';
import {useEvents} from '../../hooks/useEvents.ts';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';

export default function UserRegistrations() {
  const {text} = useLanguage();
  const {events} = useEvents();
  const {userEventRegistrations} = useEventRegistrations();
  const {user} = useUsers()
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);
  const [usedEvents, setUsedEvents] = useState<Event[]>([]);
  const now = new Date();
  const {state: {routerState: {params}}} = useWebsite();


  useEffect(() => {
    if (!!user && !isMe) {
      getUserEvents(params.user_id).then(e => {
        if (e) {
          setUsedEvents(e);
        }
      })
    } else {
      if (events) {
        setUsedEvents(events);
      }
    }
  }, [events, params, user]);

  if (!user) {
    return null
  }
  const isMe = params.user_id === user.id


  const filteredEvents = usedEvents.filter(event => userEventRegistrations.some(reg => reg.eventId === event.id &&
    (filterPastEvents || moment(event.dates[0].start).isAfter(moment(now)))))

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
              <EventCard key={event.id} event={event} agendaPage={true}
                registration={userEventRegistrations.find((e) => e.eventId === event.id)}/>
            ))
          }
        </div>
      )}
    </>
  );
}
