import { EventContent } from '../../types.ts';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import EditRegistrations from './EditRegistrations.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';
import EditDescription from './EditDescription.tsx';
import GenericPage from '../../pages/GenericPage.tsx';
import SaveButton from './SaveButton.tsx';
import { useAppState } from '../../providers/AppStateProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useEvents } from '../../hooks/useEvents.ts';


export default function EditEvent() {
  const { text } = useLanguage();
  const { createEvent, updateEvent, eventContent } = useEvents();
  const { route } = useAppState();
  const { navigate } = useAppState();
  const [event, setEvent] = useState<EventContent | null>(null);

  useEffect(() => {
    if (!event) {
      if (eventContent) {
        setEvent(eventContent);
      }

      if (route.name === 'new_event') {
        const now = new Date();
        const event: EventContent = {
          name: {
            en: 'New event',
            nl: 'Nieuwe activiteit'
          },
          dates: [{ start: now.toISOString(), end: now.toISOString() }],
          isPublished: false,
          requiredMembershipStatus: ['member'],
          eventType: 'activity',
          questions: [],
          location: ''
        };
        setEvent(event);
      }
    }
  }, [event, eventContent, route.name]);

  const id = route.params?.id;

  if (!event) {
    return <></>;
  }

  const handleEventChange = (changes: Partial<EventContent>) => {
    setEvent({
      ...event,
      ...changes
    });
  };


  const handleSave = async (bool: boolean) => {
    if (id) {
      await updateEvent(id, { ...event, isPublished: bool });
      navigate('event', { id });
    } else {
      await createEvent({ ...event, isPublished: bool });
      navigate('agenda');
    }
  };

  return (
    <GenericPage image={event.image}>
      <SaveButton id={id ?? ''} handleSave={handleSave} event={event} />

      <div className="grid xl:grid-cols-3 gap-5 mt-[-4.7rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('agenda')}>
              {text('Back to Agenda', 'Terug naar Agenda')}
            </Button>
          </div>
          {!event.isPublished && (
            <Button variant="contained">
              <b>{text('Draft', 'Concept')}</b>
            </Button>
          )}
        </div>

        <EditAgendaCard
          dates={event.dates}
          image={event.image}
          category={event.eventType}
          name={event.name}
          metadata={event.metadata}
          location={event.location}
          handleEventChange={handleEventChange}
        />

        <EditDescription
          description={event.description}
          metadata={event.metadata}
          handleEventChange={handleEventChange}
        />

        <EditRegistrations
          requiredMembershipStatus={event.requiredMembershipStatus}
          registrationMax={event.registrationMax}
          registrationPeriod={event.registrationPeriod}
          questions={event.questions}
          handleEventChange={handleEventChange}
          dates={event.dates}
        />
      </div>
    </GenericPage>
  );
}
