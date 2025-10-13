import {useEffect, useState} from 'react';
import { Switch } from '@mui/material';
import moment from 'moment';
import { useLanguage } from '../../providers/LanguageProvider';
import { useApiState } from '../../providers/ApiProvider';
import ContentCard from '../ContentCard';
import EventCard from '../event/EventCard';
import {Event} from '../../types.ts';
import {useAppState} from '../../providers/AppStateProvider.tsx';
import {useAuth} from '../../providers/AuthProvider.tsx';

export default function UserRegistrations() {
  const { text } = useLanguage();
  const { events, registeredEvents, getUserEvents } = useApiState();
  const { route } = useAppState()
  const { user } = useAuth()
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);
  const [usedEvents, setUsedEvents] = useState<Event[]>([]);
  const now = new Date();

  const isMe = route.params!.id === user?.id

  useEffect(() => {
    if (!!user && !isMe) {
      getUserEvents(route.params!.id).then(e => {
        if (e) {
          setUsedEvents(e);
        }
      })
    } else {
      if (events) {
        setUsedEvents(events);
      }
    }
  }, [events, getUserEvents, isMe, route.params, user]);
  
  const filteredEvents = usedEvents.filter(event => registeredEvents.some(reg => reg.eventId === event.id &&
      (filterPastEvents || moment(event.dates[0].start).isAfter(moment(now)))))

  return (
    <>
      <ContentCard className="mt-5">
        <div className="grid xl:grid-cols-2 justify-between">
          <h1>{isMe? text('My registrations', 'Mijn inschrijvingen') : text('Registrations', 'Inschrijvingen')}</h1>
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
                registration={registeredEvents.find((e) => e.eventId === event.id)} />
            ))
          }
        </div>
      )}
    </>
  );
}
