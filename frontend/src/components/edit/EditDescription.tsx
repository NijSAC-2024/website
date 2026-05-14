import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import {FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import {memo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import OptionSelector from '../OptionSelector.tsx';
import {
  experienceOptions,
  ExperienceType,
  EventContent
} from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {useEventRegistrationHook} from '../../hooks/useEventRegistrationHook.ts';
import {useParams} from 'react-router-dom';

function EditDescription() {
  const { text } = useLanguage();
  const { useEventRegistrations } = useEventRegistrationHook();
  const params = useParams();
  const {control, setValue} = useFormContext<EventContent>();
  const [description, metadata, category] = useWatch({
    control,
    name: ['description', 'metadata', 'eventType']
  });

  const eventRegistrations = useEventRegistrations(params.eventId)

  return (
    <div className="xl:col-span-2 flex flex-col justify-between w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]">
      {/* Description */}
      <div>
        <MarkdownEditor
          value={description}
          onChange={(markdown) => setValue('description', markdown, {shouldDirty: true})}
        />
      </div>

      {/* Gear and Experience */}
      <div
        className="grid xl:grid-cols-2 gap-3 px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <TextField
          multiline
          fullWidth
          value={metadata?.gear?.en}
          label={text(
            'Necessary Gear English ',
            'Benodigde Uitrusting Engels'
          )}
          placeholder={text(
            'Separated by commas',
            'Gescheiden door komma\'s'
          )}
          onChange={(e) =>
            setValue('metadata', {
              ...metadata,
              gear: {
                nl: metadata?.gear?.nl || '',
                en: e.target.value
              }
            }, {shouldDirty: true})
          }
        />
        <TextField
          multiline
          fullWidth
          value={metadata?.gear?.nl}
          label={text(
            'Necessary Gear Dutch',
            'Benodigde Uitrusting Nederlands'
          )}
          placeholder={text(
            'Separated by commas',
            'Gescheiden door komma\'s'
          )}
          onChange={(e) =>
            setValue('metadata', {
              ...metadata,
              gear: {
                en: metadata?.gear?.en || '',
                nl: e.target.value
              }
            }, {shouldDirty: true})
          }
        />
        <div className="xl:col-span-2 grid">
          <OptionSelector
            options={experienceOptions}
            selected={metadata?.experience}
            onChange={(selected) =>
              setValue('metadata', {
                ...metadata,
                experience: selected as ExperienceType[]
              }, {shouldDirty: true})
            }
            label={text('Necessary Experience', 'Benodigde Ervaring')}
          />
        </div>

        {/* Worga */}
        {category === 'weekend' && (
          <div className="xl:col-span-2 grid">
            <FormControl fullWidth>
              <InputLabel id="worga-select-label">
                {text('Weekend Organiser', 'Worga')}
              </InputLabel>
              <Controller
                name="metadata.worga"
                control={control}
                render={({field}) => (
                  <Select
                    labelId="worga-select-label"
                    value={field.value ?? ''}
                    label={text('Weekend Organiser', 'Worga')}
                    variant="outlined"
                    onChange={field.onChange}
                  >
                    <MenuItem value={'nobody'}>
                      {text('No one assigned', 'Niemand toegewezen')}
                    </MenuItem>
                    {eventRegistrations?.map((registration, index) => (
                      <MenuItem key={index} value={registration.id}>
                        {`${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

          </div>
        )}
      </div>
    </div>
  );
}

export default memo(EditDescription);
