import GenericPage from './GenericPage.tsx';
import EventCard from '../components/event/EventCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Fab } from '@mui/material';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';
import { useAppState } from '../providers/AppStateProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useApiState } from '../providers/ApiProvider.tsx';

export default function Event() {
  const { text } = useLanguage();
  const { navigate } = useAppState();
  const { event, registrations } = useApiState();
  const { isLoggedIn, user } = useAuth();


  if (!event) {
    return <></>;
  }

  return (
    <>
      {isLoggedIn && (user?.roles.includes('admin') || user?.roles.includes('activityCommissionMember')) && (
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
      <GenericPage image={event.image}>
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

          <EventCard event={event} agendaPage={false}
            registrationId={!!registrations && registrations.find(reg => reg.userId === user?.id)?.registrationId || null} />
          <DescriptionCard
            descriptionMarkdown={event.description || { en: '', nl: '' }}
            experience={event.metadata?.experience || []}
            gear={
              event?.metadata?.gear || {
                en: '',
                nl: ''
              }
            }
            worga={event.metadata?.worga || ''}
            category={event.eventType}
          />
          <RegistrationsCard questions={event.questions} />
        </div>
      </GenericPage>
    </>
  );
}
