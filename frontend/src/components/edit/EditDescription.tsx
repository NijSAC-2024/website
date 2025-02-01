import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import { TextField } from '@mui/material';
import { text } from '../../util.ts';
import OptionSelector from '../OptionSelector.tsx';
import { EventType, experienceOptions, LanguageType, OptionType } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';

interface EditDescriptionProps {
  descriptionMarkdown: LanguageType;
  gear: LanguageType;
  experience: OptionType[];
  handleFieldChange: (
    // eslint-disable-next-line no-unused-vars
    name: keyof EventType,
    // eslint-disable-next-line no-unused-vars
    value: LanguageType | string | OptionType[]
  ) => void;
}
export default function EditDescription({
  descriptionMarkdown,
  gear,
  experience,
  handleFieldChange
}: EditDescriptionProps) {
  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      <div>
        <MarkdownEditor
          initialMarkdown={descriptionMarkdown}
          handleFieldChange={handleFieldChange}
        />
      </div>
      <div className="grid xl:grid-cols-2 gap-3 px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <TextField
          multiline
          fullWidth
          value={gear.en}
          label={text('Necessary Gear English ', 'Benodigde Uitrusting Engels')}
          placeholder={text('Separated by commas', "Gescheiden door komma's")}
          onChange={(e) => handleFieldChange('gear', { ...gear, en: e.target.value })}
        />
        <TextField
          multiline
          fullWidth
          value={gear.nl}
          label={text('Necessary Gear Dutch', 'Benodigde Uitrusting Nederlands')}
          placeholder={text('Separated by commas', "Gescheiden door komma's")}
          onChange={(e) => handleFieldChange('gear', { ...gear, nl: e.target.value })}
        />
        <div className="xl:col-span-2 grid">
          <OptionSelector
            options={experienceOptions}
            onChange={(selectedTypes) => handleFieldChange('experience', selectedTypes)}
            label={text('Necessary Experience', 'Benodigde Ervaring')}
            initialOptions={experience}
          />
        </div>
      </div>
    </ContentCard>
  );
}
