import React from 'react';
import GenericPage from './GenericPage.tsx';
import EventCard from '../components/event/EventCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { text } from '../util.ts';
import { Activity } from '../types.ts';
import { Button, Chip, Fab } from '@mui/material';
import { useContext, useState } from 'react';
import EditEvent from '../components/edit/EditEvent.tsx';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';
import { apiFetch } from '../api.ts';
import { enqueueSnackbar } from 'notistack';
import { StateContext } from '../hooks/useState.ts';

export default function Event() {
  const {state, updateActivity, navigate} = useContext(StateContext)!
  
  const [activity, setActivity] = useState<Activity>({
    created: '', updated: '', waitingListCount: 0, waitingListMax: 0,
    id: '5',
    image:
      'https://images.squarespace-cdn.com/content/v1/531722ebe4b01396b755c991/1489157370692-DZW7VKX7TY1KBJBQFYTW/SPA+16.03+Single+Pitch+Award+assessment+02+resized.jpg?format=1500w',
    name: { en: 'Singlepitch Course', nl: 'Singlepitch Cursus' },
    activityType: 'course',
    location: {
      id: 'adf',
      name: {
        en: 'RSC',
        nl: 'RSC'
      },
      reusable: true,
      created: new Date(),
      updated: new Date()
    },
    description: {
      en: 'Every spring and autumn you can learn leadclimbing in the OV-Singlepitch course. In this course the student learns how to lead climb, and also to belay a lead climber. Because we give an OV (Outdoor leadclimbing) course, we try to prepare everyone to be able to practice this on the rocks. The exam is taken on a weekend outdoors in which the instructor assesses whether each participant individually masters the above techniques (you will then receive a KVB OV-Singlepitch certificate.)',
      nl: 'Elk voor- en najaar kan je leren voorklimmen in de cursus OV-Singlepitch. In deze cursus leert de cursist voorklimmen, en tevens zekeren voorklim situatie. Om dat we een OV (Outdoor Voorklim) cursus geven proberen we iedereen klaar te stomen om dit ook op de rotsen te kunnen beoefenen. Het examen zal buiten op de rots worden afgelegd, de instructeur beoordeelt dan bij elke deelnemer individueel of de bovengenoemde technieken beheerst (hiervoor krijg je dan een pasje KVB-OV-Singlepitch.)\n'
    },
    metadata: {
      gear: {
        en: 'HMS biner, Long slinge (120 cm; stitched), Dynamic safety line,  4 (small) screw carabiners (D-biners), Prussik rope 1 meter (5 or 6 mm)',
        nl: 'Helm, Touw, Safe Biner'
      },
      experience: ['mp']
    },
    registrationCount: 12,
    registrationMax: 20,
    dates: [{ start: new Date('2025-03-06T08:30:00.000Z'), end: new Date('2025-04-06T09:30:00.000Z') }],
    registrationPeriod: { start: new Date('2024-12-23T00:00:00.000Z'), end: new Date('2027-03-07T00:00:00.000Z') },
    questions: [
      {
        id: '1',
        question: { en: 'How many quickdraws', nl: 'Hoeveel setjes' },
        required: true,
        questionType: 'number'
      }
    ],
    isPublished: true,
    requiredMembershipStatus: ['member']
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = () => {
    setIsEditing((prevState) => !prevState);
  };

  return (
    <>
      {isEditing ? (
        <EditEvent activityContent={activity} handleUpdate={updateActivity} />
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

              <EventCard event={activity} agendaPage={false} />
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
