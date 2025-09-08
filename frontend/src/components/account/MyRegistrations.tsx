import { useState } from 'react';
import { Switch } from '@mui/material';
import moment from 'moment';
import { useLanguage } from '../../providers/LanguageProvider';
import { useApiState } from '../../providers/ApiProvider';
import ContentCard from '../ContentCard';
import EventCard from '../event/EventCard';
import {Event} from '../../types.ts';

export default function MyRegistrations() {
  const { text } = useLanguage();
  const { events, registeredEvents } = useApiState();
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);
  const now = new Date();

  return (
    <>
      <ContentCard className="p-7 mt-5">
        <div className="grid xl:grid-cols-2 justify-between">
          <h1>{text('My registrations', 'Mijn inschrijvingen')}</h1>
          <div className="flex items-center xl:justify-end">
            <p>{text('Include past events', 'Plaatsgevonden evenementen meenemen')}</p>
            <Switch
              checked={filterPastEvents}
              onChange={(_, checked) => setFilterPastEvents(checked)}
            />
          </div>
        </div>
      </ContentCard>
      <div className="grid xl:grid-cols-3 gap-5 mt-5">
        {events &&
          events.filter(event => registeredEvents.some(reg => reg.eventId === event.id &&
            (filterPastEvents || moment(event.dates[0].start).isAfter(moment(now)))))
            .map((event: Event) => (
              <EventCard key={event.id} event={event} agendaPage={true}
                registration={registeredEvents.find((e) => e.eventId === event.id)} />
            ))}
      </div>
    </>
  );
}
