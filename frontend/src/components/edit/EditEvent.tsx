import {
  Activity,
  ActivityContent,
  ActivityType,
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
  activityContent: ActivityContent;
}

export default function EditEvent({ activityContent: init }: EditEventProps) {
  const { language: lang } = useLanguage();
  const { createActivity, updateActivity } = useApiState();
  const { route } = useAppState();
  const { navigate } = useAppState();
  const [activity, setActivity] = useState<ActivityContent>(init);

  const id = route.params?.id;

  const updateEvent = (changes: Partial<ActivityContent>) => {
    setActivity((prev: ActivityContent) => ({
      ...prev,
      ...changes
    }));
  };

  const handleFieldChange = (
    name: keyof ActivityContent,
    value:
      | string
      | number
      | boolean
      | DateType
      | WeekendType[]
      | ActivityType
      | Metadata
      | Language
      | MembershipStatus[]
      | null
  ) => {
    updateEvent({
      [name]: value
    });
  };

  const handleDateChange = (index: number, startDate: boolean, value: string) => {
    updateEvent({
      dates: activity.dates.map((date, idx) =>
        idx === index ? { ...date, [startDate ? 'startDateTime' : 'endDateTime']: value } : date
      )
    });
  };

  const handleAddDate = () => {
    const now = new Date();
    updateEvent({
      dates: [...activity.dates, { start: now, end: now }]
    });
  };

  const handleRemoveDate = (index: number) =>
    updateEvent({
      dates: activity.dates.filter((_, idx) => idx !== index)
    });

  const handleRegistrationQuestionChange = (
    id: string,
    name: keyof Question,
    value: Language | boolean
  ) => {
    updateEvent({
      questions: activity.questions.map((question) =>
        question.id === id ? { ...question, [name]: value } : question
      )
    });
  };

  const handleAddRegistrationQuestion = () =>
    updateEvent({
      questions: [
        ...activity.questions,
        {
          id: crypto.randomUUID(),
          questionType: 'shortText',
          question: { en: '', nl: '' },
          required: false
        }
      ]
    });

  const handleRemoveRegistrationQuestion = (id: string) =>
    updateEvent({
      questions: activity.questions.filter((q) => q.id !== id)
    });

  const handleSave = async (bool: boolean) => {
    if (id) {
      await updateActivity(id, { ...activity, isPublished: bool });
      navigate('agenda');
    } else {
      await createActivity({ ...activity, isPublished: bool });
    }
  };

  return (
    <GenericPage image={activity.image}>
      <SaveButton
        name={activity.name}
        location={activity.location}
        category={activity.activityType}
        handleSave={handleSave}
      />

      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('agenda')}>
              {text(lang, 'Back to Agenda', 'Terug naar Agenda')}
            </Button>
          </div>
          {!activity.isPublished && (
            <Button variant="contained">
              <b>{text(lang, 'Draft', 'Concept')}</b>
            </Button>
          )}
        </div>

        <EditAgendaCard
          dates={activity.dates}
          image={activity.image}
          category={activity.activityType}
          name={activity.name}
          metadata={activity.metadata as Metadata}
          location={activity.location}
          handleFieldChange={handleFieldChange}
          handleDateChange={handleDateChange}
          handleAddDate={handleAddDate}
          handleRemoveDate={handleRemoveDate}
        />

        <EditDescription
          description={activity.description}
          metadata={activity.metadata}
          handleFieldChange={handleFieldChange}
        />

        <EditRegistrations
          requiredMembershipStatus={activity.requiredMembershipStatus}
          registrationMax={activity.registrationMax}
          registrationPeriod={activity.registrationPeriod}
          questions={activity.questions}
          handleFieldChange={handleFieldChange}
          handleRegistrationQuestionChange={handleRegistrationQuestionChange}
          handleAddRegistrationQuestion={handleAddRegistrationQuestion}
          handleRemoveRegistrationQuestion={handleRemoveRegistrationQuestion}
          dates={activity.dates}
        />
      </div>
    </GenericPage>
  );
}
