import { Activity, ActivityContent, DateType, Language, Question, WeekendType } from '../../types.ts';
import { Button } from '@mui/material';
import { text } from '../../util.ts';
import { useContext, useState } from 'react';
import EditRegistrations from './EditRegistrations.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';
import EditDescription from './EditDescription.tsx';
import GenericPage from '../../pages/GenericPage.tsx';
import SaveButton from './SaveButton.tsx';
import { StateContext } from '../../hooks/useState.ts';

interface EditEventProps {
  id?: string,
  activityContent: ActivityContent;
  create: (activity: ActivityContent) => void;
  update: (activity: ActivityContent, id: string) => void;
}

export default function EditEvent({ id, activityContent, create, update }: EditEventProps) {
  const {navigate} = useContext(StateContext);
  const [activity, setActivity] = useState<ActivityContent>(activityContent);

  const updateEvent = (changes: Partial<Activity>) => {
    setActivity((prev) => ({ ...prev, ...changes }));
  };

  const handleFieldChange = (name: keyof ActivityContent, value: string | number | boolean | DateType | WeekendType[] | null) => {
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
      dates: [
        ...activity.dates,
        { start: now, end: now }
      ]
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
        { id: crypto.randomUUID(), questionType: 'shortText', question: { en: '', nl: '' }, required: false }
      ]
    });

  const handleRemoveRegistrationQuestion = (id: string) =>
    updateEvent({
      questions: activity.questions.filter((q) => q.id !== id)
    });

  const handleSave = (bool: boolean) => {
    update({ ...activity, isPublished: bool });
  };

  return (
    <GenericPage image={activity.image}>
      <SaveButton
        startDateTime={activity.dates[0].startDateTime}
        endDateTime={activity.dates[0].endDateTime}
        title={activity.title}
        location={activity.location}
        category={activity.activityType}
        handleSave={handleSave}
      />

      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('agenda')}>
              {text('Back to Agenda', 'Terug naar Agenda')}
            </Button>
          </div>
          {!activity.isPublished && (
            <Button variant="contained">
              <b>{text('Draft', 'Concept')}</b>
            </Button>
          )}
        </div>

        <EditAgendaCard
          dates={activity.dates}
          image={activity.image}
          category={activity.activityType}
          title={activity.title}
          type={activity.type}
          location={activity.location}
          handleFieldChange={handleFieldChange}
          handleDateChange={handleDateChange}
          handleAddDate={handleAddDate}
          handleRemoveDate={handleRemoveDate}
        />

        <EditDescription
          descriptionMarkdown={activity.descriptionMarkdown}
          gear={activity.gear}
          experience={activity.experience}
          handleFieldChange={handleFieldChange}
        />

        <EditRegistrations
          requiredMembershipStatus={activity.requiredMembershipStatus}
          startDateTime={activity.dates[0].startDateTime}
          registrationMax={activity.registrationMax}
          registrationPeriod={activity.registrationPeriod}
          questions={activity.questions}
          handleFieldChange={handleFieldChange}
          handleRegistrationQuestionChange={handleRegistrationQuestionChange}
          handleAddRegistrationQuestion={handleAddRegistrationQuestion}
          handleRemoveRegistrationQuestion={handleRemoveRegistrationQuestion}
        />
      </div>
    </GenericPage>
  );
}
