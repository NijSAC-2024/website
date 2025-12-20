import GenericPage from './GenericPage.tsx';
import EventCard from '../components/event/EventCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import {Button, Fab} from '@mui/material';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {inCommittee, isAdminOrBoard} from '../util.ts';
import {useWebsite} from '../hooks/useState.ts';
import {useUsers} from '../hooks/useUsers.ts';
import {useEvents} from '../hooks/useEvents.ts';
import {useCommittees} from '../hooks/useCommittees.ts';

export default function Event() {
  const {text} = useLanguage();
  const {navigate} = useWebsite();
  const {currentEvent} = useEvents();
  const {myCommittees} = useCommittees();
  const {user} = useUsers();


  if (!currentEvent) {
    return <></>;
  }

  return (
    <>
      {user && (isAdminOrBoard(user.roles) || inCommittee(myCommittees, currentEvent.createdBy)) && (
        <div className="fixed bottom-5 right-5 z-10">
          <Fab
            variant="extended"
            color="primary"
            onClick={() => navigate('events.event.edit', {event_id: currentEvent.id})}
          >
            <EditIcon className="mr-2"/>
            {text('Edit event', 'Evenement bewerken')}
          </Fab>
        </div>
      )}
      <GenericPage image={currentEvent.image}>
        <div className="grid xl:grid-cols-3 gap-5">
          <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between items-center">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button
                color="inherit"
                onClick={() => navigate('events')}
              >
                {text('Back to Events', 'Terug naar Events')}
              </Button>
            </div>
            {!currentEvent?.isPublished && (
              <Button variant="contained">
                <b>{text('Draft', 'Concept')}</b>
              </Button>
            )}
          </div>

          <EventCard event={currentEvent} agendaPage={false}/>
          <DescriptionCard
            descriptionMarkdown={currentEvent.description || {en: '', nl: ''}}
            experience={currentEvent.metadata?.experience || []}
            gear={
              currentEvent?.metadata?.gear || {
                en: '',
                nl: ''
              }
            }
            worga={currentEvent.metadata?.worga || ''}
            category={currentEvent.eventType}
            createdBy={currentEvent.createdBy}
          />
          <RegistrationsCard questions={currentEvent.questions}/>
        </div>
      </GenericPage>
    </>
  );
}
