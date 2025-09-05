import { useState } from 'react';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import { Event, EventType, WeekendType } from '../types.ts';
import EventCard from '../components/event/EventCard.tsx';
import { useApiState } from '../providers/ApiProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import NewEventButton from '../components/buttons/NewEventButton.tsx';
import AgendaFilter from '../components/agenda/AgendaFilter.tsx';

export default function Agenda() {
  const { text } = useLanguage();
  const { events, registeredEvents } = useApiState();
  const { user } = useAuth();
  const [category, setCategory] = useState<EventType | 'all'>(
    'all'
  );
  const [type, setType] = useState<WeekendType | 'all'>('all');

  return (
    <>
      <NewEventButton />
      <GenericPage>
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-flow-row gap-5">
          <ContentCard className="lg:col-span-2 p-7">
            <h1>Agenda</h1>
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
            events.filter(
              (event: Event) =>
                (category === 'all' ||
                  event.eventType === category) &&
                (type === 'all' ||
                  event.metadata?.type?.includes(type))
            ).map((event: Event) => (
              // TODO filter out events in the past
              <EventCard key={event.id} event={event} agendaPage={true}
                registrationId={!!user && registeredEvents.find((e) => e.eventId === event.id)?.registrationId || null} />
            ))}
        </div>
      </GenericPage>
    </>
  );
}
