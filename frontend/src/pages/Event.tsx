import GenericPage from './GenericPage.tsx';
import AgendaCard from '../components/AgendaCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { text } from '../util.ts';
import moment from 'moment';
import { AgendaEventType } from '../types.ts';
import { Button, Fab } from '@mui/material';
import router from '../router.tsx';
import { useState } from 'react';
import EditEvent from '../components/edit/EditEvent.tsx';
import RegistrationsCard from '../components/event/RegistrationsCard.tsx';
import DescriptionCard from '../components/event/DescriptionCard.tsx';

export default function Event() {
  const [agendaEvent, setAgendaEvent] = useState<AgendaEventType>({
    id: 5,
    image:
      'https://images.squarespace-cdn.com/content/v1/531722ebe4b01396b755c991/1489157370692-DZW7VKX7TY1KBJBQFYTW/SPA+16.03+Single+Pitch+Award+assessment+02+resized.jpg?format=1500w',
    title: { en: 'Singlepitch Course', nl: 'Singlepitch Cursus' },
    category: 'course',
    type: ['sp'],
    location: 'RSC',
    descriptionMarkdown: {
      en: 'Every spring and autumn you can learn leadclimbing in the OV-Singlepitch course. In this course the student learns how to lead climb, and also to belay a lead climber. Because we give an OV (Outdoor leadclimbing) course, we try to prepare everyone to be able to practice this on the rocks. The exam is taken on a weekend outdoors in which the instructor assesses whether each participant individually masters the above techniques (you will then receive a KVB OV-Singlepitch certificate.)',
      nl: 'Elk voor- en najaar kan je leren voorklimmen in de cursus OV-Singlepitch. In deze cursus leert de cursist voorklimmen, en tevens zekeren voorklim situatie. Om dat we een OV (Outdoor Voorklim) cursus geven proberen we iedereen klaar te stomen om dit ook op de rotsen te kunnen beoefenen. Het examen zal buiten op de rots worden afgelegd, de instructeur beoordeelt dan bij elke deelnemer individueel of de bovengenoemde technieken beheerst (hiervoor krijg je dan een pasje KVB-OV-Singlepitch.)\n'
    },
    gear: {
      en: 'Helmet, Rope, Safe Biner',
      nl: 'Helm, Touw, Safe Biner'
    },
    experience: ['mp'],
    allowsRegistrations: true,
    numberOfRegistrations: 12,
    maxRegistrations: 20,
    startDateTime: '2025-03-06T08:30:00.000Z',
    endDateTime: '2025-04-06T09:30:00.000Z',
    registrationOpenTime: '2024-12-23T00:00:00.000Z',
    registrationCloseTime: '2027-03-07T00:00:00.000Z',
    registrationFields: [{ en: 'How many quickdraws', nl: 'Hoeveel setjes' }]
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = () => {
    setIsEditing((prevState) => !prevState);
  };
  const handleUpdate = (updatedAgendaEvent: AgendaEventType) => {
    //Send to backend
    setAgendaEvent(updatedAgendaEvent);
    toggleIsEditing();
  };
  const langCode = useLanguage().getLangCode();
  moment.locale(langCode);

  return (
    <>
      {isEditing ? (
        <EditEvent agendaEvent={agendaEvent} handleUpdate={handleUpdate} />
      ) : (
        <>
          <div className="fixed bottom-5 right-5 z-10">
            <Fab variant="extended" color="primary" onClick={toggleIsEditing}>
              <EditIcon className="mr-2" />
              {text('Edit event', 'Evenement bewerken')}
            </Fab>
          </div>
          <GenericPage image={agendaEvent.image}>
            <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
              <div className="xl:col-span-3 mb-[-0.5rem]">
                <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
                  <Button color="inherit" onClick={() => router.navigate('/agenda')}>
                    {text('Back to Agenda', 'Terug naar Agenda')}
                  </Button>
                </div>
              </div>
              <AgendaCard agendaEvent={agendaEvent} agendaPage={false} />
              <DescriptionCard agendaEvent={agendaEvent} />
              <RegistrationsCard agendaEvent={agendaEvent} />
            </div>
          </GenericPage>
        </>
      )}
    </>
  );
}
