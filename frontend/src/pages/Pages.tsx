import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {Fab, TextField} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Markdown from 'react-markdown';
import {isAdminOrBoard, truncateMarkdown} from '../util.ts';
import {useAuth} from '../providers/AuthProvider.tsx';
import {useNavigate} from 'react-router-dom';
import {usePageHook} from '../hooks/usePageHook.ts';
import {useMemo, useState} from 'react';

export default function Pages() {
  const {text} = useLanguage();
  const {user} = useAuth();
  const navigate = useNavigate();
  const {usePages} = usePageHook();
  const pages = usePages();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return pages ?? [];
    }
    return (pages ?? []).filter((p) =>
      `${p.name.en} ${p.name.nl} ${p.slug}`.toLowerCase().includes(q),
    );
  }, [pages, search]);

  return (
    <>
      {user && isAdminOrBoard(user.roles) && (
        <div className="fixed bottom-5 right-5 z-10">
          <Fab variant="extended" color="primary" onClick={() => navigate('/pages/new')}>
            <AddIcon className="mr-2"/>
            {text('Add page', 'Pagina toevoegen')}
          </Fab>
        </div>
      )}
      <GenericPage>
        <ContentCard className="grid gap-4">
          <h1>{text('Pages', 'Pagina\'s')}</h1>
          <TextField
            label={text('Search', 'Zoeken')}
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </ContentCard>

        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5 mt-4">
          {filtered.map((page) => (
            <div key={page.pageId} className="hover:cursor-pointer h-full"
              onClick={() => navigate(`/${page.slug}`)}>
              <div
                className="w-full h-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)]">
                <img
                  className="w-full aspect-[4/2] object-cover"
                  src={page.image ? `/api/file/${page.image}` : '/images/test-header-image.jpg'}
                  alt="not available"
                />
                <div className="p-5 grid gap-1">
                  <h1 className="text-3xl font-bold">{text(page.name.en, page.name.nl)}</h1>
                  <Markdown>
                    {text(
                      truncateMarkdown(page.content.en || '', 120),
                      truncateMarkdown(page.content.nl || '', 120),
                    )}
                  </Markdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GenericPage>
    </>
  );
}
