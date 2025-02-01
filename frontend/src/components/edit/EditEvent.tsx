import { EventType, OptionType, LanguageType, QuestionType } from '../../types.ts';
import { Button, Fab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../../util.ts';
import { useState } from 'react';
import EditRegistrations from './EditRegistrations.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';
import EditDescription from './EditDescription.tsx';
import router from '../../router.tsx';
import GenericPage from '../../pages/GenericPage.tsx';
import moment from 'moment';

interface EditEventProps {
  event: EventType;
  // eslint-disable-next-line no-unused-vars
  handleUpdate: (updatedEvent: EventType) => void;
}

export default function EditEvent({ event, handleUpdate }: EditEventProps) {
  const [updatedEvent, setUpdatedEvent] = useState<EventType>({ ...event });

  const updateEvent = (changes: Partial<EventType>) => {
    setUpdatedEvent((prev) => ({ ...prev, ...changes }));
  };

  const handleFieldChange = (
    name: keyof EventType,
    value: LanguageType | string | boolean | LanguageType[] | OptionType[]
  ) => {
    updateEvent({
      [name]: value
    });
  };

  const handleDateChange = (index: number, startDate: boolean, value: string) => {
    updateEvent({
      dates: updatedEvent.dates.map((date, idx) =>
        idx === index ? { ...date, [startDate ? 'startDateTime' : 'endDateTime']: value } : date
      )
    });
  };

  const handleAddDate = () => {
    const now = new Date();
    console.log('AddDate', updatedEvent.dates);
    updateEvent({
      dates: [
        ...updatedEvent.dates,
        { startDateTime: now.toISOString(), endDateTime: now.toISOString() }
      ]
    });
  };

  const handleRemoveDate = (index: number) =>
    updateEvent({
      dates: updatedEvent.dates.filter((_, idx) => idx !== index)
    });

  const handleRegistrationQuestionChange = (
    index: number,
    name: keyof QuestionType,
    value: LanguageType | boolean
  ) => {
    updateEvent({
      registrationQuestions: updatedEvent.registrationQuestions.map((question, idx) =>
        idx === index ? { ...question, [name]: value } : question
      )
    });
  };

  const handleAddRegistrationQuestion = () =>
    updateEvent({
      registrationQuestions: [
        ...updatedEvent.registrationQuestions,
        { question: { en: '', nl: '' }, required: false }
      ]
    });

  const handleRemoveRegistrationQuestion = (index: number) =>
    updateEvent({
      registrationQuestions: updatedEvent.registrationQuestions.filter((_, idx) => idx !== index)
    });

  return (
    <GenericPage image={updatedEvent.image}>
      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem]">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => router.navigate('/agenda')}>
              {text('Back to Agenda', 'Terug naar Agenda')}
            </Button>
          </div>
        </div>
        <div className="fixed bottom-5 right-5 z-10">
          <Fab
            variant="extended"
            color="primary"
            onClick={() => handleUpdate(updatedEvent)}
            disabled={
              !updatedEvent.title.en ||
              !updatedEvent.title.nl ||
              !updatedEvent.location ||
              !updatedEvent.category ||
              moment(updatedEvent.dates[0].endDateTime).isBefore(
                moment(updatedEvent.dates[0].startDateTime)
              )
            }>
            <SaveIcon className="mr-2" />
            {text('Save Event', 'Evenement opslaan')}
          </Fab>
        </div>

        <EditAgendaCard
          dates={event.dates}
          image={updatedEvent.image}
          category={updatedEvent.category}
          title={updatedEvent.title}
          type={updatedEvent.type}
          location={updatedEvent.location}
          handleFieldChange={handleFieldChange}
          handleDateChange={handleDateChange}
          handleAddDate={handleAddDate}
          handleRemoveDate={handleRemoveDate}
        />

        <EditDescription
          descriptionMarkdown={updatedEvent.descriptionMarkdown}
          gear={updatedEvent.gear}
          experience={updatedEvent.experience}
          handleFieldChange={handleFieldChange}
        />

        <EditRegistrations
          allowsRegistrations={updatedEvent.allowsRegistrations}
          startDateTime={updatedEvent.dates[0].startDateTime}
          maxRegistrations={updatedEvent.maxRegistrations}
          registrationOpenTime={updatedEvent.registrationOpenTime}
          registrationCloseTime={updatedEvent.registrationCloseTime}
          registrationQuestions={updatedEvent.registrationQuestions}
          handleFieldChange={handleFieldChange}
          handleRegistrationQuestionChange={handleRegistrationQuestionChange}
          handleAddRegistrationQuestion={handleAddRegistrationQuestion}
          handleRemoveRegistrationQuestion={handleRemoveRegistrationQuestion}
        />
      </div>
    </GenericPage>
  );
}
