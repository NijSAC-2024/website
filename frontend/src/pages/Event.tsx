import GenericPage from './GenericPage.tsx';
import EventCard from '../components/event/EventCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Fab } from '@mui/material';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';
import { useAppState } from '../providers/AppStateProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useEvents } from '../hooks/useEvents.ts';

export default function Event() {
  const { text } = useLanguage();
  const { navigate } = useAppState();
  const { event } = useEvents();
  const { isLoggedIn, user } = useAuth();


  if (!event) {
    return <></>;
  }

  return (
    <>
      {isLoggedIn && user?.roles.includes('admin') && (
        <div className="fixed bottom-5 right-5 z-10">
          <Fab
            variant="extended"
            color="primary"
            onClick={() => navigate('edit_event', { id: event.id })}
          >
            <EditIcon className="mr-2" />
            {text('Edit event', 'Evenement bewerken')}
          </Fab>
        </div>
      )}
      <GenericPage image={event?.image}>
        <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
          <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between items-center">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button
                color="inherit"
                onClick={() => navigate('agenda')}
              >
                {text('Back to Agenda', 'Terug naar Agenda')}
              </Button>
            </div>
            {!event?.isPublished && (
              <Button variant="contained">
                <b>{text('Draft', 'Concept')}</b>
              </Button>
            )}
          </div>

          <EventCard event={event} agendaPage={false} />
          <DescriptionCard
            descriptionMarkdown={event?.description || { en: '', nl: '' }}
            experience={event?.metadata?.experience || []}
            gear={
              event?.metadata?.gear || {
                en: '',
                nl: ''
              }
            }
          />
          <RegistrationsCard questions={event.questions} />
        </div>
      </GenericPage>
    </>
  );
}
