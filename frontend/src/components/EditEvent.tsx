import { AgendaEventType } from '../types.ts';
import { Fab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../util.ts';
import ContentCard from './ContentCard.tsx';
import { useState } from 'react';
import { Moment } from 'moment';
import MarkdownEditor from './MarkdownEditor.tsx';
import EditRegistrationFields from './EditRegistrationFields.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';

interface EditEventProps {
  agendaEvent: AgendaEventType;
  // eslint-disable-next-line no-unused-vars
  handleUpdate: (updatedAgendaEvent: AgendaEventType) => void;
}

export default function EditEvent({ agendaEvent, handleUpdate }: EditEventProps) {
  const [updatedAgendaEvent, setUpdatedAgendaEvent] = useState<AgendaEventType>({
    ...agendaEvent
  });

  const handleFieldChange = (name: keyof AgendaEventType, value: string | Moment | boolean) => {
    setUpdatedAgendaEvent((prev) => ({
      ...prev,
      [name]: typeof value === 'string' || typeof value === 'boolean' ? value : value.toISOString()
    }));
  };

  const handleRegistrationFieldsChange = (langCode: 'EN' | 'NL', index: number, value: string) => {
    setUpdatedAgendaEvent((prev) => {
      const newFields = [...prev[`registrationFields${langCode}`]];
      newFields[index] = value;
      return {
        ...prev,
        [`registrationFields${langCode}`]: newFields
      };
    });
  };

  const handleAddRegistrationField = (langCode: 'EN' | 'NL') => {
    setUpdatedAgendaEvent((prev) => ({
      ...prev,
      [`registrationFields${langCode}`]: [...prev[`registrationFields${langCode}`], '']
    }));
  };

  const handleRemoveRegistrationField = (langCode: 'EN' | 'NL', index: number) => {
    setUpdatedAgendaEvent((prev) => ({
      ...prev,
      [`registrationFields${langCode}`]: prev[`registrationFields${langCode}`].filter(
        (_, idx) => idx !== index
      )
    }));
  };

  const setStandardFields = (fieldsEN: string[], fieldsNL: string[]) => {
    setUpdatedAgendaEvent((prev) => ({
      ...prev,
      registrationFieldsEN: fieldsEN,
      registrationFieldsNL: fieldsNL
    }));
  };

  return (
    <>
      <div className="flex justify-end fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary" onClick={() => handleUpdate(updatedAgendaEvent)}>
          <SaveIcon className="mr-2" />
          {text('Save Event', 'Evenement opslaan')}
        </Fab>
      </div>

      <EditAgendaCard
        updatedAgendaEvent={updatedAgendaEvent}
        handleFieldChange={handleFieldChange}
      />

      <ContentCard className="xl:col-span-2">
        <MarkdownEditor
          initialMarkdownEN={updatedAgendaEvent.descriptionMarkdownEN || ''}
          initialMarkdownNL={updatedAgendaEvent.descriptionMarkdownNL || ''}
          handleFieldChange={handleFieldChange}
        />
      </ContentCard>

      <ContentCard className="xl:col-span-3 lg:col-span-2">
        <EditRegistrationFields
          updatedAgendaEvent={updatedAgendaEvent}
          handleFieldChange={handleFieldChange}
          handleRegistrationFieldsChange={handleRegistrationFieldsChange}
          handleAddRegistrationField={handleAddRegistrationField}
          handleRemoveRegistrationField={handleRemoveRegistrationField}
          setStandardFields={setStandardFields}
        />
      </ContentCard>
    </>
  );
}
