import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import { TextField } from '@mui/material';
import OptionSelector from '../OptionSelector.tsx';
import { EventContent, experienceOptions, Language, Metadata } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditDescriptionProps {
  description?: Language;
  metadata?: Metadata;
  handleFieldChange: (name: keyof EventContent, value: Metadata | Language) => void;
}

export default function EditDescription({
  description,
  metadata,
  handleFieldChange
}: EditDescriptionProps) {
  const { text } = useLanguage();

  const handleMarkdown = (markdown: Language) => {
    handleFieldChange('description', markdown);
  };

  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
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
            handleFieldChange('metadata', {
              ...metadata,
              gear: {
                ...metadata?.gear,
                en: e.target.value
              }
            } as Metadata)
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
            handleFieldChange('metadata', {
              ...metadata,
              gear: {
                ...metadata?.gear,
                en: e.target.value
              }
            } as Metadata)
          }
        />
        <div className="xl:col-span-2 grid">
          <OptionSelector
            options={experienceOptions}
            selected={metadata?.experience}
            onChange={(selected) =>
              handleFieldChange('metadata', {
                ...metadata,
                experience: selected
              } as Metadata)
            }
            label={text('Necessary Experience', 'Benodigde Ervaring')}
          />
        </div>
      </div>
    </ContentCard>
  );
}
