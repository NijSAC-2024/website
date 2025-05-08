import {
  Event,
  EventContent,
  EventType,
  DateType,
  Language,
  MembershipStatus,
  Metadata,
  Question,
  WeekendType
} from '../../types.ts';
import { Button } from '@mui/material';
import { text } from '../../util.ts';
import { useState } from 'react';
import EditRegistrations from './EditRegistrations.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';
import EditDescription from './EditDescription.tsx';
import GenericPage from '../../pages/GenericPage.tsx';
import SaveButton from './SaveButton.tsx';
import { useAppState } from '../../providers/AppStateProvider.tsx';
import { useApiState } from '../../providers/ApiProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditEventProps {
  eventContent: EventContent;
}

export default function EditEvent({ eventContent: init }: EditEventProps) {
  const { language: lang } = useLanguage();
  const { createEvent, updateEvent } = useApiState();
  const { route } = useAppState();
  const { navigate } = useAppState();
  const [event, setEvent] = useState<EventContent>(init);

  const id = route.params?.id;

  const handleEventChange = (changes: Partial<EventContent>) => {
    setEvent((prev: EventContent) => ({
      ...prev,
      ...changes
    }));
  };

  const handleFieldChange = (
    name: keyof EventContent,
    value:
      | string
      | number
      | boolean
      | DateType
      | WeekendType[]
      | EventType
      | Metadata
      | Language
      | MembershipStatus[]
      | null
  ) => {
    handleEventChange({
      [name]: value
    });
  };

  const handleDateChange = (index: number, startDate: boolean, value: string) => {
    handleEventChange({
      dates: event.dates.map((date, idx) =>
        idx === index ? { ...date, [startDate ? 'startDateTime' : 'endDateTime']: value } : date
      )
    });
  };

  const handleAddDate = () => {
    const now = new Date();
    handleEventChange({
      dates: [...event.dates, { start: now, end: now }]
    });
  };

  const handleRemoveDate = (index: number) =>
    handleEventChange({
      dates: event.dates.filter((_, idx) => idx !== index)
    });

  const handleRegistrationQuestionChange = (
    id: string,
    name: keyof Question,
    value: Language | boolean
  ) => {
    handleEventChange({
      questions: event.questions.map((question) =>
        question.id === id ? { ...question, [name]: value } : question
      )
    });
  };

  const handleAddRegistrationQuestion = () =>
    handleEventChange({
      questions: [
        ...event.questions,
        {
          id: crypto.randomUUID(),
          questionType: 'shortText',
          question: { en: '', nl: '' },
          required: false
        }
      ]
    });

  const handleRemoveRegistrationQuestion = (id: string) =>
    handleEventChange({
      questions: event.questions.filter((q) => q.id !== id)
    });

  const handleSave = async (bool: boolean) => {
    if (id) {
      await updateEvent(id, { ...event, isPublished: bool });
      navigate('agenda');
    } else {
      await createEvent({ ...event, isPublished: bool });
    }
  };

  return (
    <GenericPage image={event.image}>
      <SaveButton
        handleSave={handleSave}
      />

      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('agenda')}>
              {text(lang, 'Back to Agenda', 'Terug naar Agenda')}
            </Button>
          </div>
          {!event.isPublished && (
            <Button variant="contained">
              <b>{text(lang, 'Draft', 'Concept')}</b>
            </Button>
          )}
        </div>

        <EditAgendaCard
          dates={event.dates}
          image={event.image}
          category={event.eventType}
          name={event.name}
          metadata={event.metadata as Metadata}
          location={event.location}
          handleFieldChange={handleFieldChange}
          handleDateChange={handleDateChange}
          handleAddDate={handleAddDate}
          handleRemoveDate={handleRemoveDate}
        />

        <EditDescription
          description={event.description}
          metadata={event.metadata}
          handleFieldChange={handleFieldChange}
        />

        <EditRegistrations
          requiredMembershipStatus={event.requiredMembershipStatus}
          registrationMax={event.registrationMax}
          registrationPeriod={event.registrationPeriod}
          questions={event.questions}
          handleFieldChange={handleFieldChange}
          handleRegistrationQuestionChange={handleRegistrationQuestionChange}
          handleAddRegistrationQuestion={handleAddRegistrationQuestion}
          handleRemoveRegistrationQuestion={handleRemoveRegistrationQuestion}
          dates={event.dates}
        />
      </div>
    </GenericPage>
  );
}
