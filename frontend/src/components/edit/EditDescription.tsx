import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import { TextField } from '@mui/material';
import { text } from '../../util.ts';
import OptionSelector from '../OptionSelector.tsx';
import { Activity, experienceOptions, Language, WeekendType } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';

interface EditDescriptionProps {
  description: Language;
  gear: Language;
  experience: WeekendType[];
  handleFieldChange: (
    name: keyof Activity,
    value: Language | string | WeekendType[]
  ) => void;
}
export default function EditDescription({
  description,
  gear,
  experience,
  handleFieldChange
}: EditDescriptionProps) {
  const handleMarkdown = (markdown: Language) => {
    handleFieldChange('description', markdown);
  };

  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      {/* Description */}
      <div>
        <MarkdownEditor initialMarkdown={description} handleMarkdown={handleMarkdown} />
      </div>

      {/* Gear and Experience */}
      <div className="grid xl:grid-cols-2 gap-3 px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <TextField
          multiline
          fullWidth
          value={gear.en}
          label={text('Necessary Gear English ', 'Benodigde Uitrusting Engels')}
          placeholder={text('Separated by commas', 'Gescheiden door komma\'s')}
          onChange={(e) => handleFieldChange('gear', { ...gear, en: e.target.value })}
        />
        <TextField
          multiline
          fullWidth
          value={gear.nl}
          label={text('Necessary Gear Dutch', 'Benodigde Uitrusting Nederlands')}
          placeholder={text('Separated by commas', 'Gescheiden door komma\'s')}
          onChange={(e) => handleFieldChange('gear', { ...gear, nl: e.target.value })}
        />
        <div className="xl:col-span-2 grid">
          <OptionSelector
            options={experienceOptions}
            onChange={(selected) => handleFieldChange('experience', selected)}
            label={text('Necessary Experience', 'Benodigde Ervaring')}
            initialOptions={experience}
          />
        </div>
      </div>
    </ContentCard>
  );
}
