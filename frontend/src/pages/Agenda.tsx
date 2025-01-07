import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import AgendaCard from '../components/AgendaCard.tsx';
import { text } from '../util.ts';
import { useState } from 'react';
import { AgendaEventType } from '../types.ts';
import { Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import router from '../router.tsx';

export default function Agenda() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const exampleAPIResponse: AgendaEventType[] = [
    {
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
        en: 'HMS biner, Long slinge (120 cm; stitched), Dynamic safety line,  4 (small) screw carabiners (D-biners), Prussik rope 1 meter (5 or 6 mm)',
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
    },
    {
      id: 5,
      image:
        'https://www.climbfit.com.au/wp-content/uploads/2020/10/LRM_EXPORT_6923110695509_20190202_212254494.jpg',
      title: { en: 'Boulder Training', nl: 'Boulder Training' },
      category: 'training',
      type: ['boulder'],
      location: 'Fontainebleau',
      descriptionMarkdown: {
        en: "Let's go boulder",
        nl: 'Laten we gaan boulderen.'
      },
      gear: {
        en: '',
        nl: ''
      },
      experience: [],
      allowsRegistrations: true,
      numberOfRegistrations: 10,
      maxRegistrations: 10,
      startDateTime: '2025-03-06T22:30:00.000Z',
      endDateTime: '2025-03-06T22:30:00.000Z',
      registrationOpenTime: '2024-12-23T00:00:00.000Z',
      registrationCloseTime: '2027-03-07T00:00:00.000Z',
      registrationFields: [{ en: 'How many quickdraws', nl: 'Hoeveel setjes' }]
    }
  ];

  return (
    <>
      <div className="fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary" onClick={() => router.navigate('/add-event')}>
          <AddIcon className="mr-2" />
          <p>{text('Add event', 'Voeg evenement toe')}</p>
        </Fab>
      </div>
      <GenericPage>
        <div className="Agenda">
          <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-flow-row gap-5">
            <ContentCard className="lg:col-span-2 p-7">
              <h1>Agenda</h1>
              <p>
                {text(
                  'To register for activities you must first log in.',
                  'Om je aan te melden voor activiteiten moet je eerst ingelogd zijn.'
                )}
              </p>
              <p>
                {text(
                  'Questions about activities or climbing weekends? Contact the board or the climbing commissioner.',
                  'Vragen over activiteiten of klimweekenden? Neem contact met het bestuur of de klimcommissaris.'
                )}
              </p>
            </ContentCard>
            <ContentCard className="xl:col-span-1 lg:col-span-2 p-7">
              <h2 className="mb-3">{text('Filter', 'Filteren')}</h2>
              <FormControl fullWidth>
                <InputLabel id="select-label">{text('Category', 'Categorie')}</InputLabel>
                <Select
                  labelId="select-label"
                  value={selectedCategory}
                  label={text('Category', 'Categorie')}
                  onChange={handleChange}
                  variant="outlined">
                  <MenuItem value="all">{text('All', 'Alles')}</MenuItem>
                  <MenuItem value="activity">{text('Activities', 'Activiteiten')}</MenuItem>
                  <MenuItem value="course">{text('Courses', 'Cursussen')}</MenuItem>
                  <MenuItem value="training">{text('Trainings', 'Trainingen')}</MenuItem>
                  <MenuItem value="weekend">{text('Weekends', 'Weekenden')}</MenuItem>
                </Select>
              </FormControl>
            </ContentCard>
            {exampleAPIResponse
              .filter(
                (agendaEvent: AgendaEventType) =>
                  selectedCategory === 'all' || agendaEvent.category === selectedCategory
              )
              .map((event: AgendaEventType) => (
                <AgendaCard agendaEvent={event} agendaPage={true} key={event.id} />
              ))}
          </div>
        </div>
      </GenericPage>
    </>
  );
}
