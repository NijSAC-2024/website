import {EventContent, toEventContent} from '../../types.ts';
import {Button} from '@mui/material';
import EditEventCard from './EditEventCard.tsx';
import GenericPage from '../../pages/GenericPage.tsx';
import SaveButton from './SaveButton.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useWebsite} from '../../hooks/useState.ts';
import {useEvents} from '../../hooks/useEvents.ts';
import {useForm} from 'react-hook-form';
import EditDescription from './EditDescription.tsx';

export type EditEventForm = EventContent;

export default function EditEvent() {
  const {text} = useLanguage();
  const {navigate, state: {routerState: {params}}} = useWebsite();
  const {currentEvent, createEvent, updateEvent} = useEvents();

  let initialEvent: EventContent;
  if (currentEvent === null) {
    const now = new Date();
    initialEvent = {
      name: {
        en: 'New event',
        nl: 'Nieuwe activiteit'
      },
      description: {en: '', nl: ''},
      dates: [{start: now.toISOString(), end: now.toISOString()}],
      isPublished: false,
      requiredMembershipStatus: ['member'],
      eventType: 'activity',
      metadata: {
        type: [],
        experience: [],
        gear: {en: '', nl: ''}
      },
      questions: [],
      location: '',
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png'
    };
  } else {
    initialEvent = toEventContent(currentEvent);
  }

  const {control, register, handleSubmit, getValues, setValue} = useForm<EditEventForm>({
    defaultValues: initialEvent
  });


  const id = params.event_id;

  const handleSave = async (event: EditEventForm) => {
    if (id) {
      if (await updateEvent(id, {...event})) {
        navigate('events.event', {event_id: id});
      }
    } else {
      if (await createEvent({...event})) {
        navigate('events');
      }
    }
  };

  return (
    <GenericPage image={getValues('image')}>
      <SaveButton id={id ?? ''} handleSubmit={handleSubmit(handleSave)} setValue={setValue}/>

      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('events')}>
              {text('Back to Events', 'Terug naar Events')}
            </Button>
          </div>
          {!getValues('isPublished') && (
            <Button variant="contained">
              <b>{text('Draft', 'Concept')}</b>
            </Button>
          )}
        </div>

        <EditEventCard
          control={control}
          register={register}
          setValue={setValue}
          getValues={getValues}
        />

        <EditDescription
          control={control}
          register={register}
          setValue={setValue}
          getValues={getValues}
        />

        {/*<EditRegistrations*/}
        {/*  requiredMembershipStatus={event.requiredMembershipStatus}*/}
        {/*  registrationMax={event.registrationMax}*/}
        {/*  waitingListMax={event.waitingListMax}*/}
        {/*  registrationPeriod={event.registrationPeriod}*/}
        {/*  questions={event.questions}*/}
        {/*  handleEventChange={handleEventChange}*/}
        {/*  dates={event.dates}*/}
        {/*/>*/}
      </div>
    </GenericPage>
  );
}
