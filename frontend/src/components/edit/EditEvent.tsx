import {EventContent, toEventContent} from '../../types.ts';
import {Button} from '@mui/material';
import {FormProvider, useForm, useWatch} from 'react-hook-form';
import {useEffect, useMemo} from 'react';
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

  const initialEvent = useMemo<EventContent | null>(() => {
    if (routeName === 'events.new') {
      const now = new Date().toISOString();
      return {
        name: {
          en: 'New event',
          nl: 'Nieuwe activiteit'
        },
        dates: [{start: now, end: now}],
        isPublished: false,
        requiredMembership: ['member'],
        eventType: 'activity',
        questions: [],
        location: '',
        image: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png',
        createdBy: ''
      };
    }

    return currentEvent ? toEventContent(currentEvent) : null;
  }, [currentEvent, routeName]);

  const id = params.event_id;
  const form = useForm<EventContent>({
    defaultValues: initialEvent ?? undefined
  });

  useEffect(() => {
    if (initialEvent) {
      form.reset(initialEvent);
    }
  }, [form, initialEvent]);

  const image = useWatch({control: form.control, name: 'image'});
  const isPublished = useWatch({control: form.control, name: 'isPublished'});

  if (!initialEvent) {
    return null;
  }

  const handleSave = async (event: EventContent, isPublishedNext: boolean) => {
    if (id) {
      if (await updateEvent(id, {...event, isPublished: isPublishedNext})) {
        navigate('events.event', {event_id: id});
      }
    } else {
      if (await createEvent({...event, isPublished: isPublishedNext})) {
        navigate('events');
      }
    }
  };

  return (
    <FormProvider {...form}>
      <GenericPage image={image}>
        <SaveButton id={id ?? ''} handleSave={handleSave}/>

        <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
          <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button color="inherit" onClick={() => navigate('events')}>
                {text('Back to Events', 'Terug naar Events')}
              </Button>
            </div>
            {!isPublished && (
              <Button variant="contained">
                <b>{text('Draft', 'Concept')}</b>
              </Button>
            )}
          </div>

          <EditEventCard/>
          <EditDescription/>
          <EditRegistrations/>
        </div>
      </GenericPage>
    </FormProvider>
  );
}
