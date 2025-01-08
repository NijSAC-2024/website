import MarkdownEditor from '../MarkdownEditor.tsx';
import { TextField } from '@mui/material';
import { text } from '../../util.ts';
import OptionSelector from '../OptionSelector.tsx';
import { AgendaEventType, experienceOptions, LanguageType, OptionType } from '../../types.ts';
import ContentCard from '../ContentCard.tsx';

interface EditDescriptionProps {
  updatedAgendaEvent: AgendaEventType;
  handleFieldChange: (
    // eslint-disable-next-line no-unused-vars
    name: keyof AgendaEventType,
    // eslint-disable-next-line no-unused-vars
    value: LanguageType | string | OptionType[]
  ) => void;
}
export default function EditDescription({
  updatedAgendaEvent,
  handleFieldChange
}: EditDescriptionProps) {
  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      <div>
        <MarkdownEditor
          initialMarkdown={updatedAgendaEvent.descriptionMarkdown}
          handleFieldChange={handleFieldChange}
        />
      </div>
      <div className="grid xl:grid-cols-2 gap-3 px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <TextField
          multiline
          fullWidth
          value={updatedAgendaEvent.gear.en}
          label={text('Necessary Gear English ', 'Benodigde Uitrusting Engels')}
          placeholder={text('Separated by commas', "Gescheiden door komma's")}
          onChange={(e) =>
            handleFieldChange('gear', { ...updatedAgendaEvent.gear, en: e.target.value })
          }
        />
        <TextField
          multiline
          fullWidth
          value={updatedAgendaEvent.gear.nl}
          label={text('Necessary Gear Dutch', 'Benodigde Uitrusting Nederlands')}
          placeholder={text('Separated by commas', "Gescheiden door komma's")}
          onChange={(e) =>
            handleFieldChange('gear', { ...updatedAgendaEvent.gear, nl: e.target.value })
          }
        />
        <div className="xl:col-span-2 grid">
          <OptionSelector
            options={experienceOptions}
            onChange={(selectedTypes) => handleFieldChange('experience', selectedTypes)}
            label={text('Necessary Experience', 'Benodigde Ervaring')}
            initialOptions={updatedAgendaEvent.experience}
          />
        </div>
      </div>
    </ContentCard>
  );
}
