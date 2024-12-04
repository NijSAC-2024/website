import GenericPage from './GenericPage.tsx';
import AgendaCard from '../components/AgendaCard.tsx';
import ContentCard from '../components/ContentCard.tsx';
import EditIcon from '@mui/icons-material/Edit';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import text from '../util.ts';
import moment from 'moment';
import Markdown from 'react-markdown';
import { ExpandedAgendaEventType } from '../types.ts';
import { Button, Table, TableBody, TableCell, TableRow } from '@mui/material';

export default function Event() {
  const agendaEvent: ExpandedAgendaEventType = {
    id: 1,
    image: '/images/test-header-image.jpg',
    titleEN: 'Albufeira',
    titleNL: 'Albufeira',
    category: 'weekend',
    locationEN: 'Albufeira',
    locationNL: 'Albufeira',
    descriptionMarkdownEN: '**You** must register to participate!',
    descriptionMarkdownNL: 'Je moet je registreren om mee te doen!',
    registrations: 12,
    maxRegistrations: 20,
    startDateTime: '2025-03-06T00:00:00.000Z',
    endDateTime: '2025-03-08T00:00:00.000Z',
    registrationOpenTime: '2023-03-05T00:00:00.000Z',
    registrationCloseTime: '2027-03-07T00:00:00.000Z',
    registrationsTable: [
      {
        id: 1,
        name: 'Lukas Nieuweboer'
      },
      {
        id: 1,
        name: 'Asia Piotrowska'
      },
      {
        id: 1,
        name: 'Robin Put'
      }
    ]
  };
  const langCode = useLanguage().getLangCode();
  moment.locale(langCode);

  return (
    <>
      <div className="flex justify-end fixed bottom-5 right-5 z-10">
        <Button variant="contained">
          <EditIcon className="mr-2" />
          {text('Edit event', 'Event bewerken')}
        </Button>
      </div>
      <GenericPage>
        <div className="grid xl:grid-cols-3 lg:col-span-2 grid-flow-row gap-5">
          <AgendaCard {...agendaEvent} />
          <ContentCard className="xl:col-span-2">
            <Markdown>
              {text(agendaEvent.descriptionMarkdownEN, agendaEvent.descriptionMarkdownNL)}
            </Markdown>
          </ContentCard>

          <ContentCard className="xl:col-span-3 lg:col-span-2">
            <h1>{text('Participants', 'Deelnemers')}</h1>

            <Table>
              <TableBody>
                {agendaEvent.registrationsTable.map((registraton) => (
                  <TableRow
                    key={registraton.id}
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
