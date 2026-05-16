import {useNavigate, useParams} from 'react-router-dom';
import {usePageHook} from '../hooks/usePageHook.ts';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useAuth} from '../providers/AuthProvider.tsx';
import {Fab} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {isAdminOrBoard} from '../util.ts';

export default function MarkdownPage() {
  const {slug} = useParams();
  const {text} = useLanguage();
  const {user} = useAuth();
  const navigate = useNavigate();
  const {usePage} = usePageHook();
  const page = usePage(slug);

  if (!page) {
    return null;
  }

  return (
    <>
      {user && isAdminOrBoard(user.roles) && (
        <div className="fixed bottom-5 right-5 z-10 flex gap-3">
          <Fab variant="extended" color="primary" onClick={() => navigate(`/${page.slug}/edit`)}>
            <EditIcon className="mr-2"/>
            {text('Edit page', 'Pagina bewerken')}
          </Fab>
        </div>
      )}
      <GenericPage image={page.image ? `/api/file/${page.image}` : undefined}>
        <ContentCard>
          <h1>{text(page.name.en, page.name.nl)}</h1>
          <Markdown remarkPlugins={[remarkGfm]}>
            {text(page.content.en || '', page.content.nl || '')}
          </Markdown>
        </ContentCard>
      </GenericPage>
    </>
  );
}
