import React from 'react';
import GenericPage from './GenericPage.tsx';
import ActivityCard from '../components/event/ActivityCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { text } from '../util.ts';
import { Button, Chip, Fab } from '@mui/material';
import { useContext, useState } from 'react';
import EditEvent from '../components/edit/EditEvent.tsx';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';
import { StateContext } from '../hooks/useState.ts';

export default function Event() {
  const {state, navigate} = useContext(StateContext);
  const activity = state.activity;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = () => {
    setIsEditing((prevState) => !prevState);
  };

  return (
    <>
      {isEditing ? (
        <EditEvent activityContent={activity} />
      ) : (
        <>
          <div className="fixed bottom-5 right-5 z-10">
            <Fab variant="extended" color="primary" onClick={toggleIsEditing}>
              <EditIcon className="mr-2" />
              {text('Edit event', 'Evenement bewerken')}
            </Fab>
          </div>
          <GenericPage image={activity.image}>
            <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
              <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between items-center">
                <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
                  <Button color="inherit" onClick={() => navigate('/agenda')}>
                    {text('Back to Agenda', 'Terug naar Agenda')}
                  </Button>
                </div>
                {!activity.isPublished && (
                  <Chip
                    label={text('Draft', 'Concept')}
                    className="uppercase font-semibold"
                    color="primary"
                  />
                )}
              </div>

              <ActivityCard activity={activity} agendaPage={false} />
              <DescriptionCard
                descriptionMarkdown={activity.description}
                experience={activity.metadata?.experience}
                gear={activity.metadata?.gear}
              />
              <RegistrationsCard allowsRegistrations={activity.allowsRegistrations} />
            </div>
          </GenericPage>
        </>
      )}
    </>
  );
}
