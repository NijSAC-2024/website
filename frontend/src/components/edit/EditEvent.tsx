import { AgendaEventType, OptionType, LanguageType } from '../../types.ts';
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
  agendaEvent: AgendaEventType;
  // eslint-disable-next-line no-unused-vars
  handleUpdate: (updatedAgendaEvent: AgendaEventType) => void;
}

export default function EditEvent({ agendaEvent, handleUpdate }: EditEventProps) {
  const [updatedAgendaEvent, setUpdatedAgendaEvent] = useState<AgendaEventType>({ ...agendaEvent });

  const updateAgendaEvent = (changes: Partial<AgendaEventType>) => {
    setUpdatedAgendaEvent((prev) => ({ ...prev, ...changes }));
  };

  const handleFieldChange = (
    name: keyof AgendaEventType,
    value: LanguageType | string | boolean | LanguageType[] | OptionType[]
  ) => {
    updateAgendaEvent({
      [name]: value
    });
  };

  const handleRegistrationFieldsChange = (langCode: 'en' | 'nl', index: number, value: string) => {
    updateAgendaEvent({
      registrationFields: updatedAgendaEvent.registrationFields.map((field, idx) =>
        idx === index ? { ...field, [langCode]: value } : field
      )
    });
  };

  const handleAddRegistrationField = () =>
    setUpdatedAgendaEvent((prev) => ({
      ...prev,
      registrationFields: [...prev.registrationFields, { en: '', nl: '' }]
    }));

  const handleRemoveRegistrationField = (index: number) =>
    setUpdatedAgendaEvent((prev) => ({
      ...prev,
      registrationFields: prev.registrationFields.filter((_, idx) => idx !== index)
    }));

  return (
    <GenericPage image={updatedAgendaEvent.image}>
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
            onClick={() => handleUpdate(updatedAgendaEvent)}
            disabled={
              !updatedAgendaEvent.title.en ||
              !updatedAgendaEvent.title.nl ||
              !updatedAgendaEvent.location ||
              !updatedAgendaEvent.category ||
              moment(updatedAgendaEvent.endDateTime).isBefore(
                moment(updatedAgendaEvent.startDateTime)
              )
            }>
            <SaveIcon className="mr-2" />
            {text('Save Event', 'Evenement opslaan')}
          </Fab>
        </div>

        <EditAgendaCard
          updatedAgendaEvent={updatedAgendaEvent}
          handleFieldChange={handleFieldChange}
        />

        <EditDescription
          updatedAgendaEvent={updatedAgendaEvent}
          handleFieldChange={handleFieldChange}
        />

        <EditRegistrations
          updatedAgendaEvent={updatedAgendaEvent}
          handleFieldChange={handleFieldChange}
          handleRegistrationFieldsChange={handleRegistrationFieldsChange}
          handleAddRegistrationField={handleAddRegistrationField}
          handleRemoveRegistrationField={handleRemoveRegistrationField}
        />
      </div>
    </GenericPage>
  );
}
