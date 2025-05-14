import { useState } from 'react';
import GenericPage from './GenericPage.tsx';
import EventCard from '../components/event/EventCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Chip, Fab } from '@mui/material';
import EditEvent from '../components/edit/EditEvent.tsx';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';
import { useAppState } from '../providers/AppStateProvider.tsx';
import { useApiState } from '../providers/ApiProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { toEventContent } from '../types.ts';

export default function Event() {
  const { text } = useLanguage();
  const { navigate } = useAppState();
  const { event } = useApiState();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = () => {
    setIsEditing((prevState) => !prevState);
  };

  return (
    <>
      {!event ? (
        'Loading'
      ) : (
        <>
          {isEditing ? (
            <EditEvent eventContent={toEventContent(event)} />
          ) : (
            <>
              <div className="fixed bottom-5 right-5 z-10">
                <Fab
                  variant="extended"
                  color="primary"
                  onClick={toggleIsEditing}
                >
                  <EditIcon className="mr-2" />
                  {text('Edit event', 'Evenement bewerken')}
                </Fab>
              </div>
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
                      <Chip
                        label={text('Draft', 'Concept')}
                        className="uppercase font-semibold"
                        color="primary"
                      />
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
                  <RegistrationsCard />
                </div>
              </GenericPage>
            </>
          )}
        </>
      )}
    </>
  );
}
