import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import MarkdownEditor from '../components/MarkdownEditor.tsx';

export default function TextPage() {
  return (
    <GenericPage>
      <ContentCard className="p-7">
        <MarkdownEditor initialContent="# Hello, Markdown!" />
      </ContentCard>
    </GenericPage>
  );
}
