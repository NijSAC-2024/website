import {Collapse, Switch, TextField} from '@mui/material';
import {DateTimePicker} from '@mui/x-date-pickers';
import moment from 'moment';
import {memo, useEffect, useRef} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {EventContent, memberOptions, Membership, Question} from '../../types.ts';
import OptionSelector from '../OptionSelector.tsx';
import EditRegistrationQuestions from './EditRegistrationQuestions.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {mpQuestions, spQuestions, weekendQuestions} from './questionTemplates.ts';

function EditRegistrations() {
  const {text} = useLanguage();
  const {control, setValue} = useFormContext<EventContent>();
  const [requiredMembership, dates, registrationMax, waitingListMax, registrationPeriod, category, type] = useWatch({
    control,
    name: [
      'requiredMembership',
      'dates',
      'registrationMax',
      'waitingListMax',
      'registrationPeriod',
      'eventType',
      'metadata.type'
    ]
  });

  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${category}:${(type ?? []).join(',')}`;
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

    setValue('questions', baseQuestions.map((q) => ({...q, id: crypto.randomUUID()})), {shouldDirty: true});
  }, [category, setValue, type]);

  const handleToggleRegistrations = () => {
    if (registrationPeriod) {
      setValue('registrationPeriod', undefined, {shouldDirty: true});
      setValue('registrationMax', undefined, {shouldDirty: true});
      setValue('waitingListMax', undefined, {shouldDirty: true});
      return;
    }

    const now = new Date().toISOString();
    setValue('registrationPeriod', {
      start: now,
      end: dates[0]?.start || now
    }, {shouldDirty: true});
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
              onChange={(_, checked) => {
                setValue('registrationMax', checked ? 10 : undefined, {shouldDirty: true});
                if (!checked) {
                  setValue('waitingListMax', undefined, {shouldDirty: true});
                }
              }}
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
                    setValue('registrationMax', value, {shouldDirty: true});
                  }
                }}
              />

              <div className="flex items-center mb-3">
                <p>{text('Maximum waiting queue', 'Maximale wachtrij')}</p>
                <Switch
                  checked={waitingListMax !== undefined}
                  onChange={(_, checked) =>
                    setValue('waitingListMax', checked ? 10 : undefined, {shouldDirty: true})
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
                      setValue('waitingListMax', value, {shouldDirty: true});
                    }
                  }}
                />
              </Collapse>
            </div>
          </Collapse>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="registrationPeriod.start"
              control={control}
              render={({field}) => (
                <DateTimePicker
                  label={text(
                    'Start Date Registrations',
                    'Startdatum Inschrijvingen'
                  )}
                  value={field.value ? moment(field.value) : null}
                  onChange={(date) => {
                    if (!date || !registrationPeriod) {
                      return;
                    }
                    setValue('registrationPeriod', {
                      start: date.toISOString(),
                      end: registrationPeriod.end
                    }, {shouldDirty: true});
                  }}
                />
              )}
            />
            <Controller
              name="registrationPeriod.end"
              control={control}
              render={({field}) => (
                <DateTimePicker
                  label={text(
                    'End Date Registrations',
                    'Einddatum Inschrijvingen'
                  )}
                  value={field.value ? moment(field.value) : null}
                  onChange={(date) => {
                    if (!date || !registrationPeriod) {
                      return;
                    }
                    setValue('registrationPeriod', {
                      start: registrationPeriod.start,
                      end: date.toISOString()
                    }, {shouldDirty: true});
                  }}
                />
              )}
            />
          </div>

          <OptionSelector
            options={memberOptions}
            selected={requiredMembership}
            onChange={(selected) =>
              setValue('requiredMembership', selected as Membership[], {shouldDirty: true})
            }
            label={text(
              'Required Membership',
              'Benodigd Lidmaatschap'
            )}
          />

          <EditRegistrationQuestions/>
        </div>
      </Collapse>
    </div>
  );
}

export default memo(EditRegistrations);
