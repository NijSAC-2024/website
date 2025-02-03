import { text } from '../../util.ts';
import { Collapse, Switch, TextField } from '@mui/material';
import { EventType, LanguageType, memberOptions, OptionType, QuestionType } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import OptionSelector from '../OptionSelector.tsx';
import EditRegistrationQuestions from './EditRegistrationQuestions.tsx';

interface EditRegistrationProps {
  allowsRegistrations: boolean;
  requiredMembershipStatus: OptionType[];
  startDateTime: string;
  hasMaxRegistrations: boolean;
  maxRegistrations?: number;
  registrationOpenTime?: string;
  registrationCloseTime?: string;
  registrationQuestions: QuestionType[];
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof EventType, value: string | boolean | OptionType[]) => void;
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
  requiredMembershipStatus,
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
          {/* Max Registrations and Registration Dates */}
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
          <OptionSelector
            options={memberOptions}
            onChange={(selected) => handleFieldChange('requiredMembershipStatus', selected)}
            label={text('Necessary Membership Status', 'Benodigd Lidmaatschapstatus')}
            initialOptions={requiredMembershipStatus}
          />

          {/* Registration Questions */}
          <EditRegistrationQuestions
            registrationQuestions={registrationQuestions}
            handleRegistrationQuestionChange={handleRegistrationQuestionChange}
            handleAddRegistrationQuestion={handleAddRegistrationQuestion}
            handleRemoveRegistrationQuestion={handleRemoveRegistrationQuestion}
          />
        </div>
      </Collapse>
    </ContentCard>
  );
}
