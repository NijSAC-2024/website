import { text } from '../../util.ts';
import { Collapse, Fab, Switch, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgendaEventType } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';

interface EditRegistrationFieldsProps {
  updatedAgendaEvent: AgendaEventType;
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof AgendaEventType, value: string | boolean) => void;
  // eslint-disable-next-line no-unused-vars
  handleRegistrationFieldsChange: (langCode: 'en' | 'nl', index: number, value: string) => void;
  handleAddRegistrationField: () => void;
  // eslint-disable-next-line no-unused-vars
  handleRemoveRegistrationField: (index: number) => void;
}

export default function EditRegistrationFields({
  updatedAgendaEvent,
  handleFieldChange,
  handleRegistrationFieldsChange,
  handleAddRegistrationField,
  handleRemoveRegistrationField
}: EditRegistrationFieldsProps) {
  return (
    <ContentCard className="xl:col-span-3">
      <div className="flex justify-between p-7">
        <h1>{text('Registrations', 'Inschrijvingen')}</h1>
        <div>
          {text('Allow registrations', 'Open voor inschrijvingen')}
          <Switch
            checked={updatedAgendaEvent.allowsRegistrations}
            onChange={() =>
              handleFieldChange('allowsRegistrations', !updatedAgendaEvent.allowsRegistrations)
            }
          />
        </div>
      </div>
      <Collapse in={updatedAgendaEvent.allowsRegistrations} timeout="auto" unmountOnExit>
        <div className="grid p-7 space-y-3 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <TextField
            type="number"
            label={text('Maximum Registrations', 'Maximaal aantal inschrijvingen')}
            value={updatedAgendaEvent.maxRegistrations || ''}
            onChange={(e) => handleFieldChange('maxRegistrations', e.target.value)}
          />
          <h3>{text('Registration Fields', 'Inschrijfvelden')}</h3>
          {updatedAgendaEvent.registrationFields.map((field, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex w-full space-x-2">
                <TextField
                  value={field.en}
                  label={`${text('Field', 'Veld')} ${index + 1} ${text('English', 'Engels')}`}
                  onChange={(e) => handleRegistrationFieldsChange('en', index, e.target.value)}
                  fullWidth
                />
                <TextField
                  value={field.nl}
                  label={`${text('Field', 'Veld')} ${index + 1} ${text('Dutch', 'Nederlands')}`}
                  onChange={(e) => handleRegistrationFieldsChange('nl', index, e.target.value)}
                  fullWidth
                />
              </div>
              <Fab size="small" color="error" onClick={() => handleRemoveRegistrationField(index)}>
                <DeleteIcon />
              </Fab>
            </div>
          ))}
          <div className="flex justify-center">
            <Fab size="small" color="primary" onClick={() => handleAddRegistrationField()}>
              <AddIcon />
            </Fab>
          </div>
        </div>
      </Collapse>
    </ContentCard>
  );
}
