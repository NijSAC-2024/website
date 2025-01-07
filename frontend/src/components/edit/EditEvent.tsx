import { AgendaEventType, OptionType, LanguageType } from '../../types.ts';
import { Fab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../../util.ts';
import { useState } from 'react';
import EditRegistrationFields from './EditRegistrationFields.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';
import EditDescription from './EditDescription.tsx';

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
    <>
      <div className="fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary" onClick={() => handleUpdate(updatedAgendaEvent)}>
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

      <EditRegistrationFields
        updatedAgendaEvent={updatedAgendaEvent}
        handleFieldChange={handleFieldChange}
        handleRegistrationFieldsChange={handleRegistrationFieldsChange}
        handleAddRegistrationField={handleAddRegistrationField}
        handleRemoveRegistrationField={handleRemoveRegistrationField}
      />
    </>
  );
}
