import GenericPage from './GenericPage.tsx';
import AgendaCard from '../components/AgendaCard.tsx';
import ContentCard from '../components/ContentCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { getLabel, text } from '../util.ts';
import moment from 'moment';
import Markdown from 'react-markdown';
import { AgendaEventType, registrationsType } from '../types.ts';
import { Button, Chip, Fab, Table, TableBody, TableCell, TableRow } from '@mui/material';
import router from '../router.tsx';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import EditEvent from '../components/EditEvent.tsx';

export default function Event() {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const toggleIsEditing = () => {
    setIsEditing((prevState) => !prevState);
  };

  const handleUpdate = (updatedAgendaEvent: AgendaEventType) => {
    //Do update to backend
    console.log(updatedAgendaEvent);
    toggleIsEditing();
  };

  const agendaEvent: AgendaEventType = {
    id: 5,
    image: '/images/test-header-image.jpg',
    title: { en: 'Albufeira', nl: 'Albufeira' },
    category: 'activity',
    type: ['sp'],
    location: 'The Yard',
    descriptionMarkdown: {
      en: 'No registration required. This means that you do not have to do anything to participate in this activity. Jeeh.',
      nl: 'Je hoeft je niet in te schrijven'
    },
    gear: {
      en: 'Helmet, Rope, Safe Biner, Belaying Device, Harness',
      nl: 'Helm, Touw, Safe Biner'
    },
    experience: ['mp'],
    allowsRegistrations: true,
    numberOfRegistrations: 12,
    maxRegistrations: 20,
    startDateTime: '2025-03-06T22:30:00.000Z',
    endDateTime: '2025-03-06T22:30:00.000Z',
    registrationOpenTime: '2024-12-23T00:00:00.000Z',
    registrationCloseTime: '2027-03-07T00:00:00.000Z',
    registrationFields: [{ en: 'How many quickdraws', nl: 'Hoeveel setjes' }]
  };

  const registrations: registrationsType = {
    registrations: [
      {
        eid: 1,
        name: 'Lukas Nieuweboer'
      },
      {
        eid: 2,
        name: 'Asia Piotrowska'
      },
      {
        eid: 3,
        name: 'Robin Put'
      }
    ]
  };
  const langCode = useLanguage().getLangCode();
  moment.locale(langCode);

  const gearArray = agendaEvent.gear.en.split(',').map((enItem, index) => ({
    en: enItem.trim(),
    nl: agendaEvent.gear.nl.split(',')[index]?.trim() || ''
  }));

  return (
    <>
      <div className="flex justify-end fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary" onClick={toggleIsEditing}>
          <EditIcon className="mr-2" />
          {text('Edit event', 'Evenement bewerken')}
        </Fab>
      </div>
      <GenericPage>
        <div className="grid xl:grid-cols-3 lg:col-span-2 grid-flow-row gap-5">
          <div className="xl:col-span-3 lg:col-span-2 mb-[-0.5rem]">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button color="inherit" onClick={() => router.navigate('/agenda')}>
                {text('Back to Agenda', 'Terug naar Agenda')}
              </Button>
            </div>
          </div>
          {isEditing ? (
            <EditEvent agendaEvent={agendaEvent} handleUpdate={handleUpdate} />
          ) : (
            <>
              <AgendaCard agendaEvent={agendaEvent} agendaPage={false} />
              <ContentCard className="xl:col-span-2">
                <div className="lg:min-h-[17.4rem] p-7">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {text(agendaEvent.descriptionMarkdown.en, agendaEvent.descriptionMarkdown.nl)}
                  </Markdown>
                </div>
                <div className="flex justify-between px-7 py-3 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
                  <div>
                    <b className="text-[#1976d2] dark:text-[#90caf9]">
                      {text('Necessary Gear', 'Benodigde Uitrusting')}
                    </b>
                    <div className="flex flex-wrap space-x-1 mt-1">
                      {gearArray.map((gear, index) => (
                        <Chip
                          key={index}
                          label={text(gear.en, gear.nl)}
                          className="uppercase font-semibold"
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <b className="text-[#1976d2] dark:text-[#90caf9]">
                      {text('Necessary Experience', 'Benodigde Ervaring')}
                    </b>
                    <div className="flex flex-wrap space-x-1 mt-1">
                      {agendaEvent.experience.map((experience, index) => (
                        <Chip
                          key={index}
                          label={text(getLabel(experience).en, getLabel(experience).nl)}
                          className="uppercase font-semibold"
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </ContentCard>

              <ContentCard className="xl:col-span-3 lg:col-span-2 p-7">
                <h1>{text('Participants', 'Deelnemers')}</h1>
                <Table>
                  <TableBody>
                    {registrations.registrations.map((registraton) => (
                      <TableRow
                        key={registraton.eid}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{registraton.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ContentCard>
            </>
          )}
        </div>
      </GenericPage>
    </>
  );
}
