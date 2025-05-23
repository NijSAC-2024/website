import { Collapse, Switch, TextField } from '@mui/material';
import { DateType, EventContent, Language, memberOptions, MembershipStatus, Question } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import OptionSelector from '../OptionSelector.tsx';
import EditRegistrationQuestions from './EditRegistrationQuestions.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditRegistrationProps {
  requiredMembershipStatus: MembershipStatus[];
  dates: Array<DateType>;
  registrationMax?: number;
  registrationPeriod?: DateType;
  questions: Question[];
  handleFieldChange: (
    name: keyof EventContent,
    value: MembershipStatus[] | DateType | number | null
  ) => void;
  handleRegistrationQuestionChange: (
    id: string,
    name: keyof Question,
    value: Language | boolean
  ) => void;
  handleAddRegistrationQuestion: () => void;
  handleRemoveRegistrationQuestion: (id: string) => void;
}

export default function EditRegistrations({
  requiredMembershipStatus,
  dates,
  registrationMax,
  registrationPeriod,
  questions,
  handleFieldChange,
  handleRegistrationQuestionChange,
  handleAddRegistrationQuestion,
  handleRemoveRegistrationQuestion
}: EditRegistrationProps) {
  const { text } = useLanguage();
  const handleToggleRegistrations = () => {
    const now = new Date();
    handleFieldChange('registrationPeriod', {
      start: now.toISOString(),
      end: dates[0]?.start || now.toISOString()
    });
  };

  return (
    <ContentCard className="xl:col-span-3">
      <div className="flex justify-between p-7">
        <h1>{text('Registrations', 'Inschrijvingen')}</h1>
        <div className="flex items-center">
          <p>{text('Allow registrations', 'Open voor inschrijvingen')}</p>
          <Switch
            checked={!!registrationPeriod}
            onChange={handleToggleRegistrations}
          />
        </div>
      </div>
      <Collapse in={!!registrationPeriod} timeout="auto" unmountOnExit>
        <div className="grid p-7 gap-3 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          {/* Max Registrations and Registration Dates */}
          <div className="flex items-center">
            <p>
              {text('Maximum registrations', 'Maximum inschrjvingen')}
            </p>
            <Switch
              checked={!!registrationMax}
              onChange={(_, checked) =>
                handleFieldChange('registrationMax', checked ? 10 : null)
              }
            />
          </div>
          <Collapse in={!!registrationMax} timeout="auto" unmountOnExit>
            <TextField
              fullWidth
              type="number"
              label={text(
                'Maximum Registrations',
                'Maximaal Aantal Inschrijvingen'
              )}
              value={registrationMax || 10}
              onChange={(e) =>
                handleFieldChange('registrationMax', parseInt(e.target.value))
              }
            />
          </Collapse>
          <div className="grid grid-cols-2 gap-3">
            <DateTimePicker
              label={text(
                'Start Date Registrations',
                'Startdatum Inschrijvingen'
              )}
              value={moment(registrationPeriod?.start)}
              onChange={(date) =>
                handleFieldChange('registrationPeriod', {
                  start: date!.toISOString(false),
                  end: registrationPeriod!.end
                })
              }
            />
            <DateTimePicker
              label={text(
                'End Date Registrations',
                'Einddatum Inschrijvingen'
              )}
              value={moment(registrationPeriod?.end)}
              onChange={(date) =>
                handleFieldChange('registrationPeriod', {
                  start: date!.toISOString(false),
                  end: registrationPeriod!.end
                })
              }
            />
          </div>
          <OptionSelector
            options={memberOptions}
            selected={requiredMembershipStatus}
            onChange={(selected) =>
              handleFieldChange(
                'requiredMembershipStatus',
                selected as MembershipStatus[]
              )
            }
            label={text(
              'Necessary Membership Status',
              'Benodigd Lidmaatschapstatus'
            )}
          />

          {/* Registration Questions */}
          <EditRegistrationQuestions
            registrationQuestions={questions}
            handleRegistrationQuestionChange={handleRegistrationQuestionChange}
            handleAddRegistrationQuestion={handleAddRegistrationQuestion}
            handleRemoveRegistrationQuestion={handleRemoveRegistrationQuestion}
          />
        </div>
      </Collapse>
    </ContentCard>
  );
}
