import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import {FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import OptionSelector from '../OptionSelector.tsx';
import {
  EventContent,
  experienceOptions,
  ExperienceType,
  Language, typesOptions,
} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';
import {Control, UseFormGetValues, UseFormRegister, UseFormSetValue} from 'react-hook-form';
import {EditEventForm} from './EditEvent.tsx';
import {FormInputText} from '../form/FormInputText.tsx';
import FormInputOptionSelector from '../form/FormInputOptionSelector.tsx';
import {FormInputSelect} from '../form/FormInputSelect.tsx';

interface EditDescriptionProps {
  control: Control<EditEventForm>,
  register: UseFormRegister<EditEventForm>,
  setValue: UseFormSetValue<EventContent>;
  getValues: UseFormGetValues<EventContent>;
}

export default function EditDescription({
                                          control,
                                          register,
                                          setValue,
                                          getValues
                                        }: EditDescriptionProps) {
  const {text} = useLanguage();
  const {eventRegistrations} = useEventRegistrations();


  const handleMarkdown = (markdown: Language) => {
    handleEventChange({description: markdown});
  };

  return (
    <div
      className="xl:col-span-2 flex flex-col justify-between w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]">
      {/* Description */}
      <div>
        <MarkdownEditor
          initialMarkdown={getValues('description')}
          handleMarkdown={handleMarkdown}
        />
      </div>

      {/* Gear and Experience */}
      <div
        className="grid xl:grid-cols-2 gap-3 px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <FormInputText
          multiline
          {...register('metadata.gear.en')}
          control={control}
          label={text(
            'Necessary Gear English ',
            'Benodigde Uitrusting Engels'
          )}
          placeholder={text(
            'Separated by commas',
            'Gescheiden door komma\'s'
          )}
          size='medium'
        />
        <FormInputText
          multiline
          {...register('metadata.gear.nl')}
          control={control}
          label={text(
            'Necessary Gear Dutch',
            'Benodigde Uitrusting Nederlands'
          )}
          placeholder={text(
            'Separated by commas',
            'Gescheiden door komma\'s'
          )}
          size='medium'
        />
        <div className="xl:col-span-2 grid">
          <FormInputOptionSelector
            {...register('metadata.experience')}
            control={control}
            label={text('Necessary Experience', 'Benodigde Ervaring')}
            options={experienceOptions.map(({id, label}) => {
              return {value: id, label: text(label)};
            })}
          />
        </div>

        {/* Worga */}
        {getValues('eventType') === 'weekend' && (
          <div className="xl:col-span-2 grid">
            <FormInputSelect
              {...register('metadata.worga')}
              label={text('Weekend Organiser', 'Worga')}
              control={control}
              options={[{
                value: 'nobody',
                label: text('No one assigned', 'Niemand toegewezen')
              }, ...eventRegistrations?.map((registration) => {
                return {
                  value: registration.registrationId,
                  label: `${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`
                };
              }) || []]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
