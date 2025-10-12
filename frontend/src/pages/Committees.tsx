import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import { useApiState } from '../providers/ApiProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import {useAppState} from '../providers/AppStateProvider.tsx';
import {useAuth} from '../providers/AuthProvider.tsx';
import {Fab} from '@mui/material';
import {truncateMarkdown} from '../util.ts';
import Markdown from 'react-markdown';
import AddIcon from '@mui/icons-material/Add';

export default function Committees() {
  const { text } = useLanguage();
  const { committees } = useApiState();
  const { navigate } = useAppState()
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      {isLoggedIn && user?.roles.includes('admin') && (
        <div className="fixed bottom-5 right-5 z-10">
          <Fab
            variant="extended"
            color="primary"
            onClick={() => navigate('new_committee')}
          >
            <AddIcon className="mr-2" />
            {text('Add committee', 'Voeg Commissie Toe')}
          </Fab>
        </div>
      )}
      
      <GenericPage>
        <ContentCard>
          <h1>{text('Committees', 'Commissies')}</h1>
          <p>
            {text(
              'View all committees and their members.',
              'Bekijk alle commissies en hun leden.'
            )}
          </p>
        </ContentCard>

        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5 mt-4">
          {committees?.length > 0 &&
              committees.map((committee) => (
                <div
                  key={committee.id}
                  onClick={() => navigate('committee', { id: committee.id })}
                  className="hover:cursor-pointer h-full"
                >
                  <div className="w-full h-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)]">
                    <img
                      className="w-full aspect-[4/2] object-cover"
                      src={
                        committee.image
                          ? committee.image.startsWith('https://')
                            ? committee.image
                            : `/api/file/${committee.image}`
                          : '/images/test-header-image.jpg'
                      }
                      alt="not available"
                    />
                    <div className="p-5 grid gap-1">
                      <h1 className="text-3xl font-bold">
                        {text(committee.name?.en, committee.name.nl)}
                      </h1>
                      <Markdown>
                        {text(
                          truncateMarkdown(committee.description?.en || '', 120),
                          truncateMarkdown(committee.description?.nl || '', 120)
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
