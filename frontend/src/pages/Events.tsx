import { useState } from 'react';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import { Event, EventType, WeekendType } from '../types.ts';
import EventCard from '../components/event/EventCard.tsx';
import { useApiState } from '../providers/ApiProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import NewEventButton from '../components/buttons/NewEventButton.tsx';
import AgendaFilter from '../components/agenda/AgendaFilter.tsx';
import moment from 'moment/moment';
import {Switch} from '@mui/material';

export default function Events() {
  const { text } = useLanguage();
  const { events, registeredEvents } = useApiState();
  const [category, setCategory] = useState<EventType | 'all'>(
    'all'
  );
  const [type, setType] = useState<WeekendType | 'all'>('all');
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);

  const now = new Date();

  return (
    <>
      <NewEventButton />
      <GenericPage>
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-flow-row gap-5">
          <ContentCard className="lg:col-span-2">
            <div className="grid xl:grid-cols-2 justify-between">
              <h1>Agenda</h1>
              <div className="flex items-center xl:justify-end">
                <p>{text('Include past events', 'Plaatsgevonden evenementen meenemen')}</p>
                <Switch
                  checked={filterPastEvents}
                  onChange={(_, checked) => setFilterPastEvents(checked)}
                />
              </div>
            </div>
            <p>
              {text(
                'To register for events you must first log in.',
                'Om je aan te melden voor evenementen moet je eerst ingelogd zijn.'
              )}
            </p>
            <p>
              {text(
                'Questions about activities or climbing weekends? Contact the board or the climbing commissioner.',
                'Vragen over activiteiten of klimweekenden? Neem contact met het bestuur of de klimcommissaris.'
              )}
            </p>
          </ContentCard>
          <AgendaFilter category={category} setCategory={setCategory} type={type} setType={setType}/>
          {events &&
            events
              .filter(
                (event: Event) =>
                  (category === 'all' || event.eventType === category) &&
                  (type === 'all' || event.metadata?.type?.includes(type))
              )
              .flatMap((event: Event) =>
                event.dates
                  .map((date, originalIndex) => ({ date, originalIndex }))
                  .filter(
                    ({ date }) => filterPastEvents || moment(date.end).isAfter(moment(now))
                  )
                  .map(({ date, originalIndex }) => (
                    <EventCard
                      key={`${event.id}-${originalIndex}`}
                      event={{
                        ...event,
                        dates: [date],
                        ...(event.dates.length > 1 && {
                          name: {
                            en: `${event.name.en} ${originalIndex + 1}/${event.dates.length}`,
                            nl: `${event.name.nl} ${originalIndex + 1}/${event.dates.length}`,
                          },
                        }),
                      }}
                      agendaPage={true}
                      registration={registeredEvents.find((e) => e.eventId === event.id)}
                    />
                  ))
              )}

        </div>
      </GenericPage>
    </>
  );
}
