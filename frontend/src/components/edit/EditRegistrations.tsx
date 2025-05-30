import { Collapse, Switch, TextField } from '@mui/material';
import { DateType, EventContent, memberOptions, MembershipStatus, Question } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import OptionSelector from '../OptionSelector.tsx';
import EditRegistrationQuestions from './EditRegistrationQuestions.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useState } from 'react';

interface EditRegistrationProps {
  requiredMembershipStatus: MembershipStatus[];
  dates: Array<DateType>;
  registrationMax?: number;
  registrationPeriod?: DateType;
  questions: Question[];
  handleEventChange: (update: Partial<EventContent>) => void;
}

export default function EditRegistrations({
  requiredMembershipStatus,
  dates,
  registrationMax,
  registrationPeriod,
  questions,
  handleEventChange,
}: EditRegistrationProps) {
  const { text } = useLanguage();
  const [hasRegistrationLimit, setHasRegistrationLimit] = useState(!!registrationMax);
  const handleToggleRegistrations = () => {
    if (registrationPeriod) {
      handleEventChange({ registrationPeriod: undefined });
    } else {
      const now = new Date();
      handleEventChange({
        registrationPeriod: {
          start: now.toISOString(),
          end: dates[0]?.start || now.toISOString()
        }
      });
    }
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
              checked={hasRegistrationLimit}
              onChange={(_, checked) => {
                setHasRegistrationLimit(checked);
                handleEventChange({ registrationMax: checked ? 10 : undefined });
              }}
            />
          </div>
          <Collapse in={hasRegistrationLimit} timeout="auto" unmountOnExit>
            <TextField
              fullWidth
              type="number"
              label={text(
                'Maximum Registrations',
                'Maximaal Aantal Inschrijvingen'
              )}
              value={registrationMax || 0}
              onChange={(e) => {
                registrationMax = parseInt(e.target.value);
                if (!isNaN(registrationMax) && registrationMax > 0) {
                  handleEventChange({ registrationMax });
                }
              }}
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
                handleEventChange({
                  registrationPeriod: {
                    start: date!.toISOString(),
                    end: registrationPeriod!.end
                  }
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
                handleEventChange({
                  registrationPeriod: {
                    start: registrationPeriod!.start,
                    end: date!.toISOString()
                  }
                })
              }
            />
          </div>
          <OptionSelector
            options={memberOptions}
            selected={requiredMembershipStatus}
            onChange={(selected) =>
              handleEventChange(
                {
                  requiredMembershipStatus:
                    selected as MembershipStatus[]
                })
            }
            label={text(
              'Necessary Membership Status',
              'Benodigd Lidmaatschapstatus'
            )}
          />

          {/* Registration Questions */}
          <EditRegistrationQuestions
            questions={questions}
            handleEventChange={handleEventChange}
          />
        </div>
      </Collapse>
    </ContentCard>
  );
}
