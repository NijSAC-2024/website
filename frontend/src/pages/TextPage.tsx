import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import MarkdownEditor from '../components/markdown/MarkdownEditor.tsx';
import { LanguageType } from '../types.ts';

export default function TextPage() {
  const handleMarkdown = (markdown: LanguageType) => {
    console.log(markdown);
  };
  return (
    <GenericPage>
      <ContentCard className="p-7">
        <MarkdownEditor handleMarkdown={handleMarkdown} />
      </ContentCard>
    </GenericPage>
  );
}
