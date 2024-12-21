import { text } from '../util.ts';
import { Button, Collapse, Fab, Switch, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgendaEventType } from '../types.ts';
import { Moment } from 'moment/moment';
import Tooltip from '@mui/material/Tooltip';

interface EditRegistrationFieldsProps {
  updatedAgendaEvent: AgendaEventType;
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof AgendaEventType, value: string | Moment | boolean) => void;
  // eslint-disable-next-line no-unused-vars
  handleRegistrationFieldsChange: (langCode: 'EN' | 'NL', index: number, value: string) => void;
  // eslint-disable-next-line no-unused-vars
  handleAddRegistrationField: (langCode: 'EN' | 'NL') => void;
  // eslint-disable-next-line no-unused-vars
  handleRemoveRegistrationField: (langCode: 'EN' | 'NL', index: number) => void;
  // eslint-disable-next-line no-unused-vars
  setStandardFields: (fieldsEN: string[], fieldsNL: string[]) => void;
}

export default function EditRegistrationFields({
  updatedAgendaEvent,
  handleFieldChange,
  handleRegistrationFieldsChange,
  handleAddRegistrationField,
  handleRemoveRegistrationField,
  setStandardFields
}: EditRegistrationFieldsProps) {
  const standardWeekendFieldsEN = ['Arrival Time', 'Departure Time', 'Dietary Preferences'];
  const standardWeekendFieldsNL = ['Aankomsttijd', 'Vertrektijd', 'Dieetvoorkeuren'];
  const standardCourseFieldsEN = ['Experience'];
  const standardCourseFieldsNL = ['Ervaring'];
  const renderRegistrationFields = (langCode: 'EN' | 'NL') => (
    <>
      <h3>
        {text(
          `Registration Fields ${langCode === 'EN' ? 'English' : 'Dutch'}`,
          `Inschrijfvelden ${langCode === 'EN' ? 'Engels' : 'Nederlands'}`
        )}
      </h3>
      {updatedAgendaEvent[`registrationFields${langCode}`].map((field, index) => (
        <div key={`${langCode}-${index}`} className="flex items-center space-x-2">
          <TextField
            fullWidth
            value={field}
            label={`${text('Field', 'Veld')} ${index + 1}`}
            onChange={(e) => handleRegistrationFieldsChange(langCode, index, e.target.value)}
          />
          <Fab
            size="small"
            color="error"
            onClick={() => handleRemoveRegistrationField(langCode, index)}
          >
            <DeleteIcon />
          </Fab>
        </div>
      ))}
      <div className="flex justify-center">
        <Fab size="small" color="primary" onClick={() => handleAddRegistrationField(langCode)}>
          <AddIcon />
        </Fab>
      </div>
    </>
  );

  return (
    <>
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
          <div className="flex space-x-2">
            <Tooltip
              title={text('Standard fields for weekends', 'Standaard velden voor weekenden')}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => setStandardFields(standardWeekendFieldsEN, standardWeekendFieldsNL)}
              >
                {text('Weekend', 'Weekend')}
              </Button>
            </Tooltip>
            <Tooltip title={text('Standard field for courses', 'Standaard velden voor curussen')}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setStandardFields(standardCourseFieldsEN, standardCourseFieldsNL)}
              >
                {text('Course', 'Cursus')}
              </Button>
            </Tooltip>
          </div>
          {renderRegistrationFields('EN')}
          {renderRegistrationFields('NL')}
        </div>
      </Collapse>
    </>
  );
}
