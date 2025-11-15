import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import {FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import OptionSelector from '../OptionSelector.tsx';
import {
  EventContent, EventType,
  experienceOptions,
  ExperienceType,
  Language,
  Metadata,
} from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';

interface EditDescriptionProps {
  description?: Language;
  metadata?: Metadata;
  handleEventChange: (change: Partial<EventContent>) => void;
  category: EventType;
}

export default function EditDescription({
  description,
  metadata,
  handleEventChange,
  category
}: EditDescriptionProps) {
  const { text } = useLanguage();
  const { eventRegistrations } = useEventRegistrations();


  const handleMarkdown = (markdown: Language) => {
    handleEventChange({ description: markdown });
  };

  return (
    <div className="xl:col-span-2 flex flex-col justify-between w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]">
      {/* Description */}
      <div>
        <MarkdownEditor
          initialMarkdown={description}
          handleMarkdown={handleMarkdown}
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
            handleEventChange({
              metadata: {
                ...metadata,
                gear: {
                  nl: metadata?.gear?.nl || '',
                  en: e.target.value
                }
              }
            })
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
            handleEventChange({
              metadata: {
                ...metadata,
                gear: {
                  en: metadata?.gear?.en || '',
                  nl: e.target.value
                }
              }
            })
          }
        />
        <div className="xl:col-span-2 grid">
          <OptionSelector
            options={experienceOptions}
            selected={metadata?.experience}
            onChange={(selected) =>
              handleEventChange({
                metadata: {
                  ...metadata,
                  experience: selected as ExperienceType[]
                }
              })
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
              <Select
                labelId="worga-select-label"
                value={metadata?.worga}
                label={text('Weekend Organiser', 'Worga')}
                variant="outlined"
                onChange={(e) =>
                  handleEventChange({
                    metadata: {
                      ...metadata,
                      worga: e.target.value
                    }
                  })
                }
              >
                <MenuItem value={'nobody'}>
                  {text('No one assigned', 'Niemand toegewezen')}
                </MenuItem>
                {eventRegistrations?.map((registration, index) => (
                  <MenuItem key={index} value={`${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}>
                    {`${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </div>
        )}
      </div>
    </div>
  );
}
