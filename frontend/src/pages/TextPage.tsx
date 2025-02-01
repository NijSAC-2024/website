import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import MarkdownEditor from '../components/markdown/MarkdownEditor.tsx';
import { AgendaEventType, LanguageType } from '../types.ts';
import { Moment } from 'moment';

export default function TextPage() {
  const handleFieldChange = (
    name: keyof AgendaEventType,
    value: string | Moment | boolean | LanguageType
  ) => {
    console.log(name, value);
  };
  return (
    <GenericPage>
      <ContentCard className="p-7">
        <MarkdownEditor handleFieldChange={handleFieldChange} />
      </ContentCard>
    </GenericPage>
  );
}
