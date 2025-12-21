import {Collapse, Switch, TextField} from '@mui/material';
import {
  DateType,
  EventContent,
  EventType,
  memberOptions,
  MembershipStatus,
  Question,
  WeekendType
} from '../../types.ts';
import {DateTimePicker} from '@mui/x-date-pickers';
import moment from 'moment';
import OptionSelector from '../OptionSelector.tsx';
import EditRegistrationQuestions from './EditRegistrationQuestions.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useEffect, useRef} from 'react';
import {mpQuestions, spQuestions, weekendQuestions} from './questionTemplates.ts';

interface EditRegistrationProps {
  requiredMembershipStatus: MembershipStatus[];
  dates: Array<DateType>;
  registrationMax?: number;
  waitingListMax?: number;
  registrationPeriod?: DateType;
  questions: Question[];
  handleEventChange: (update: Partial<EventContent>) => void;
  category: EventType;
  type?: WeekendType[];
}

export default function EditRegistrations({
  requiredMembershipStatus,
  dates,
  registrationMax,
  waitingListMax,
  registrationPeriod,
  questions,
  handleEventChange,
  category,
  type
}: EditRegistrationProps) {
  const {text} = useLanguage();

  /** prevent repeated recomputation */
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${category}:${type ?? ''}`;
    if (lastKeyRef.current === key) {
      return;
    }
    lastKeyRef.current = key;

    let baseQuestions: Omit<Question, 'id'>[] = [];
    if (category === 'course') {
      if (type?.includes('sp')) {
        baseQuestions = spQuestions;
      } else if (type?.includes('mp')) {
        baseQuestions = mpQuestions;
      }
    } else if (category === 'weekend') {
      baseQuestions = weekendQuestions;
    }

    handleEventChange({
      questions: baseQuestions.map(q => ({...q, id: crypto.randomUUID()}))
    });
  }, [category, type, handleEventChange]);

  const handleToggleRegistrations = () => {
    if (registrationPeriod) {
      handleEventChange({registrationPeriod: undefined});
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
    <div
      className="w-full rounded-2xl xl:col-span-3 bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]">
      <div className="p-5 xl:p-7 grid xl:grid-cols-2 justify-between w-full">
        <h1>{text('Registrations', 'Inschrijvingen')}</h1>
        <div className="flex items-center xl:justify-end">
          <p>{text('Allow registrations', 'Open voor inschrijvingen')}</p>
          <Switch
            checked={!!registrationPeriod}
            onChange={handleToggleRegistrations}
          />
        </div>
      </div>

      <Collapse in={!!registrationPeriod} timeout="auto" unmountOnExit>
        <div
          className="grid gap-3 p-5 xl:px-7 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <p>{text('Maximum registrations', 'Maximum inschrjvingen')}</p>
            <Switch
              checked={!!registrationMax}
              onChange={(_, checked) =>
                handleEventChange({
                  waitingListMax: undefined,
                  registrationMax: checked ? 10 : undefined
                })
              }
            />
          </div>

          <Collapse in={!!registrationMax} timeout="auto" unmountOnExit>
            <div className="grid">
              <TextField
                fullWidth
                type="number"
                label={text(
                  'Maximum Registrations',
                  'Maximaal Aantal Inschrijvingen'
                )}
                value={registrationMax || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    handleEventChange({registrationMax: value});
                  }
                }}
              />

              <div className="flex items-center mb-3">
                <p>{text('Maximum waiting queue', 'Maximale wachtrij')}</p>
                <Switch
                  checked={waitingListMax !== undefined}
                  onChange={(_, checked) =>
                    handleEventChange({
                      waitingListMax: checked ? 10 : undefined
                    })
                  }
                />
              </div>

              <Collapse in={waitingListMax !== undefined} timeout="auto" unmountOnExit>
                <TextField
                  fullWidth
                  type="number"
                  label={text(
                    'Maximum Waiting Queue',
                    'Maximale Wachtrij'
                  )}
                  value={waitingListMax || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      handleEventChange({waitingListMax: value});
                    }
                  }}
                />
              </Collapse>
            </div>
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
              handleEventChange({
                requiredMembershipStatus: selected as MembershipStatus[]
              })
            }
            label={text(
              'Necessary Membership Status',
              'Benodigd Lidmaatschapstatus'
            )}
          />

          <EditRegistrationQuestions
            questions={questions}
            handleEventChange={handleEventChange}
          />
        </div>
      </Collapse>
    </div>
  );
}
