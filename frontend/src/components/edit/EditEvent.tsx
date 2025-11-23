import {EventContent, toEventContent} from '../../types.ts';
import {Button} from '@mui/material';
import {useState} from 'react';
import EditRegistrations from './EditRegistrations.tsx';
import EditEventCard from './EditEventCard.tsx';
import EditDescription from './EditDescription.tsx';
import GenericPage from '../../pages/GenericPage.tsx';
import SaveButton from './SaveButton.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useWebsite} from '../../hooks/useState.ts';
import {useEvents} from '../../hooks/useEvents.ts';


export default function EditEvent() {
  const {text} = useLanguage();
  const {navigate, state: {routerState: {params, name: routeName}}} = useWebsite();
  const {currentEvent, createEvent, updateEvent} = useEvents();

  let initialEvent: EventContent | null = null;
  if (routeName === 'events.new') {
    const now = new Date();
    initialEvent = {
      name: {
        en: 'New event',
        nl: 'Nieuwe activiteit'
      },
      dates: [{start: now.toISOString(), end: now.toISOString()}],
      isPublished: false,
      requiredMembershipStatus: ['member'],
      eventType: 'activity',
      questions: [],
      location: '',
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png'
    };
  } else if (currentEvent) {
    initialEvent = toEventContent(currentEvent);
  }

  const [event, setEvent] = useState<EventContent | null>(initialEvent);

  const id = params.event_id;

  if (!event) {
    return null;
  }

  const handleEventChange = (changes: Partial<EventContent>) => {
    setEvent({
      ...event,
      ...changes
    });
  };


  const handleSave = async (bool: boolean) => {
    if (id) {
      if (await updateEvent(id, {...event, isPublished: bool})){
        navigate('events.event', {event_id: id});
      }
    } else {
      if (await createEvent({...event, isPublished: bool})){
        navigate('events');
      }
    }
  };

  return (
    <GenericPage image={event.image}>
      <SaveButton id={id ?? ''} handleSave={handleSave} event={event}/>

      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('events')}>
              {text('Back to Events', 'Terug naar Events')}
            </Button>
          </div>
          {!event.isPublished && (
            <Button variant="contained">
              <b>{text('Draft', 'Concept')}</b>
            </Button>
          )}
        </div>

        <EditEventCard
          dates={event.dates}
          image={event.image}
          category={event.eventType}
          name={event.name}
          metadata={event.metadata}
          location={event.location}
          createdBy={event.createdBy}
          handleEventChange={handleEventChange}
        />

        <EditDescription
          description={event.description}
          metadata={event.metadata}
          handleEventChange={handleEventChange}
          category={event.eventType}
        />

        <EditRegistrations
          requiredMembershipStatus={event.requiredMembershipStatus}
          registrationMax={event.registrationMax}
          waitingListMax={event.waitingListMax}
          registrationPeriod={event.registrationPeriod}
          questions={event.questions}
          handleEventChange={handleEventChange}
          dates={event.dates}
        />
      </div>
    </GenericPage>
  );
}
