import GenericPage from './GenericPage.tsx';
import AgendaCard from '../components/AgendaCard.tsx';
import ContentCard from '../components/ContentCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import { text } from '../util.ts';
import moment from 'moment';
import Markdown from 'react-markdown';
import { AgendaEventType, registrationsType } from '../types.ts';
import { Button, Fab, Table, TableBody, TableCell, TableRow } from '@mui/material';
import router from '../router.tsx';

export default function Event() {
  const agendaEvent: AgendaEventType = {
    id: 1,
    image: '/images/test-header-image.jpg',
    titleEN: 'Albufeira',
    titleNL: 'Albufeira',
    category: 'weekend',
    locationEN: 'Albufeira',
    locationNL: 'Albufeira',
    descriptionMarkdownEN:
      'You must _register_ to participate! *This is a long message* to test if it is cut off. Because we do not want to show the whole description in this menu.',
    descriptionMarkdownNL: 'Je moet je registreren om mee te doen!',
    numberOfRegistrations: 12,
    maxRegistrations: 20,
    startDateTime: '2025-03-06T00:00:00.000Z',
    endDateTime: '2025-03-08T00:00:00.000Z',
    registrationOpenTime: '2023-03-05T00:00:00.000Z',
    registrationCloseTime: '2027-03-07T00:00:00.000Z'
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

  return (
    <>
      <div className="flex justify-end fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary">
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
          <AgendaCard agendaEvent={agendaEvent} agendaPage={false} />
          <ContentCard className="xl:col-span-2 p-7">
            <Markdown>
              {text(agendaEvent.descriptionMarkdownEN, agendaEvent.descriptionMarkdownNL)}
            </Markdown>
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
        </div>
      </GenericPage>
    </>
  );
}
