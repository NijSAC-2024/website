import { AgendaEventType, OptionType, experienceOptions, LanguageType } from '../types.ts';
import { Fab, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../util.ts';
import ContentCard from './ContentCard.tsx';
import { useState } from 'react';
import MarkdownEditor from './MarkdownEditor.tsx';
import EditRegistrationFields from './EditRegistrationFields.tsx';
import EditAgendaCard from './EditAgendaCard.tsx';
import OptionSelector from './OptionSelector.tsx';

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

      <ContentCard className="xl:col-span-2 flex flex-col justify-between">
        <div>
          <MarkdownEditor
            initialMarkdown={updatedAgendaEvent.descriptionMarkdown}
            handleFieldChange={handleFieldChange}
          />
        </div>
        <div className="grid xl:grid-cols-2 gap-3 px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <TextField
            fullWidth
            value={updatedAgendaEvent.gear.en}
            label={text('Necessary Gear English ', 'Benodigde Uitrusting Engels')}
            placeholder={text('Describe items separated by ,', 'Beschrijf items gesheiden door ,')}
            onChange={(e) =>
              handleFieldChange('gear', { ...updatedAgendaEvent.gear, en: e.target.value })
            }
          />
          <TextField
            fullWidth
            value={updatedAgendaEvent.gear.nl}
            label={text('Necessary Gear Dutch', 'Benodigde Uitrusting Nederlands')}
            placeholder={text('Describe items separated by ,', 'Beschrijf items gesheiden door ,')}
            onChange={(e) =>
              handleFieldChange('gear', { ...updatedAgendaEvent.gear, nl: e.target.value })
            }
          />
          <div className="xl:col-span-2 grid">
            <OptionSelector
              options={experienceOptions}
              onChange={(selectedTypes) => handleFieldChange('experience', selectedTypes)}
              label={text('Necessary Experience', 'Benodigde Ervaring')}
              initialOptions={updatedAgendaEvent.experience}
            />
          </div>
        </div>
      </ContentCard>

      <ContentCard className="xl:col-span-3">
        <EditRegistrationFields
          updatedAgendaEvent={updatedAgendaEvent}
          handleFieldChange={handleFieldChange}
          handleRegistrationFieldsChange={handleRegistrationFieldsChange}
          handleAddRegistrationField={handleAddRegistrationField}
          handleRemoveRegistrationField={handleRemoveRegistrationField}
        />
      </ContentCard>
    </>
  );
}
