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
import {useEventHook} from '../../hooks/useEventHook.ts';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import LoadingPage from '../loading/LoadingPage.tsx';


export default function EditEvent() {
  const {text} = useLanguage();
  const {useEvent, createEvent, updateEvent} = useEventHook();
  const location = useLocation();
  const {eventId} = useParams();
  const navigate = useNavigate();

  const currentEvent = useEvent(eventId)

  const initialEvent = useMemo<EventContent | null>(() => {
    if (location.pathname === '/events/new') {
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
  }, [currentEvent, location.pathname]);

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
    return <LoadingPage/>;
  }

  const handleSave = async (event: EventContent, isPublishedNext: boolean) => {
    if (eventId) {
      if (await updateEvent(eventId, {...event, isPublished: isPublishedNext})) {
        navigate(`/events/${eventId}`);
      }
    } else {
      if (await createEvent({...event, isPublished: isPublishedNext})) {
        navigate('/events');
      }
    }
  };

  return (
    <FormProvider {...form}>
      <GenericPage image={image}>
        <SaveButton id={eventId ?? ''} handleSave={handleSave}/>

        <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
          <div className="xl:absolute xl:z-50 xl:-mt-[3.3rem] -mb-2  xl:col-span-3 flex justify-between">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button color="inherit" onClick={() => navigate(`/events${eventId ? `/${eventId}` : ''}`)}>
                {text(`Back to Event${!eventId ? 's' : ''}`, `Terug naar Evenement${!eventId ? 'en' : ''}`)}
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
