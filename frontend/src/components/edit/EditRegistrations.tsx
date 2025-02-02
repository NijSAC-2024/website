import { text } from '../../util.ts';
import { Checkbox, Collapse, Fab, Switch, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { EventType, LanguageType, QuestionType } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import Tooltip from '@mui/material/Tooltip';

interface EditRegistrationProps {
  allowsRegistrations: boolean;
  startDateTime: string;
  hasMaxRegistrations: boolean;
  maxRegistrations?: number;
  registrationOpenTime?: string;
  registrationCloseTime?: string;
  registrationQuestions: QuestionType[];
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof EventType, value: string | boolean) => void;
  handleRegistrationQuestionChange: (
    // eslint-disable-next-line no-unused-vars
    index: number,
    // eslint-disable-next-line no-unused-vars
    name: keyof QuestionType,
    // eslint-disable-next-line no-unused-vars
    value: LanguageType | boolean
  ) => void;
  handleAddRegistrationQuestion: () => void;
  // eslint-disable-next-line no-unused-vars
  handleRemoveRegistrationQuestion: (index: number) => void;
}

export default function EditRegistrations({
  allowsRegistrations,
  startDateTime,
  hasMaxRegistrations,
  maxRegistrations,
  registrationOpenTime,
  registrationCloseTime,
  registrationQuestions,
  handleFieldChange,
  handleRegistrationQuestionChange,
  handleAddRegistrationQuestion,
  handleRemoveRegistrationQuestion
}: EditRegistrationProps) {
  const handleToggleRegistrations = () => {
    const now = new Date();
    handleFieldChange('allowsRegistrations', !allowsRegistrations);
    handleFieldChange('registrationOpenTime', now.toISOString());
    handleFieldChange('registrationCloseTime', startDateTime);
  };
  return (
    <ContentCard className="xl:col-span-3">
      <div className="flex justify-between p-7">
        <h1>{text('Registrations', 'Inschrijvingen')}</h1>
        <div className="flex items-center">
          <p>{text('Allow registrations', 'Open voor inschrijvingen')}</p>
          <Switch checked={allowsRegistrations} onChange={handleToggleRegistrations} />
        </div>
      </div>
      <Collapse in={allowsRegistrations} timeout="auto" unmountOnExit>
        <div className="grid p-7 gap-3 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          {/* Registration Info*/}
          <div className="flex items-center">
            <p>{text('Maximum registrations', 'Maximum inschrjvingen')}</p>
            <Switch
              checked={hasMaxRegistrations}
              onChange={() => handleFieldChange('hasMaxRegistration', !hasMaxRegistrations)}
            />
          </div>
          <Collapse in={hasMaxRegistrations} timeout="auto" unmountOnExit>
            <TextField
              fullWidth
              type="number"
              label={text('Maximum Registrations', 'Maximaal Aantal Inschrijvingen')}
              value={maxRegistrations || ''}
              onChange={(e) => handleFieldChange('maxRegistrations', e.target.value)}
            />
          </Collapse>
          <div className="grid grid-cols-2 gap-3">
            <DateTimePicker
              label={text('Start Date Registrations', 'Startdatum Inschrijvingen')}
              value={moment(registrationOpenTime)}
              onChange={(date) => handleFieldChange('registrationOpenTime', date!.toISOString())}
            />
            <DateTimePicker
              label={text('End Date Registrations', 'Einddatum Inschrijvingen')}
              value={moment(registrationCloseTime)}
              onChange={(date) => handleFieldChange('registrationCloseTime', date!.toISOString())}
            />
          </div>

          {/* Registration Questions*/}
          <h3>{text('Registration Questions', 'Inschrijfvragen')}</h3>
          {registrationQuestions.length === 0 ? (
            <p>{text('No questions yet.', 'Nog geen vragen.')}</p>
          ) : (
            <div className="grid gap-2">
              {registrationQuestions.map((question, index) => (
                <div key={index} className="flex items-center z-0">
                  <div className="flex w-full gap-2">
                    <TextField
                      multiline
                      value={question.question.en}
                      label={`${text('Question', 'Vraag')} ${index + 1} ${text('English', 'Engels')}`}
                      onChange={(e) =>
                        handleRegistrationQuestionChange(index, 'question', {
                          en: e.target.value,
                          nl: question.question.nl
                        })
                      }
                      fullWidth
                    />
                    <TextField
                      multiline
                      value={question.question.nl}
                      label={`${text('Question', 'Vraag')} ${index + 1} ${text('Dutch', 'Nederlands')}`}
                      onChange={(e) =>
                        handleRegistrationQuestionChange(index, 'question', {
                          en: question.question.en,
                          nl: e.target.value
                        })
                      }
                      fullWidth
                    />
                  </div>
                  <div className="flex">
                    <Tooltip title={text('Required', 'Verplicht')}>
                      <Checkbox
                        checked={question.required}
                        onChange={() =>
                          handleRegistrationQuestionChange(index, 'required', !question.required)
                        }
                      />
                    </Tooltip>
                    <Tooltip title={text('Delete Question', 'Verwijder Vraag')}>
                      <Fab
                        size="small"
                        color="error"
                        onClick={() => handleRemoveRegistrationQuestion(index)}>
                        <DeleteIcon />
                      </Fab>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <Tooltip title={text('Add Question', 'Voeg Vraag Toe')}>
              <Fab size="small" color="primary" onClick={() => handleAddRegistrationQuestion()}>
                <AddIcon />
              </Fab>
            </Tooltip>
          </div>
        </div>
      </Collapse>
    </ContentCard>
  );
}
