import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import EventCard from '../components/event/EventCard.tsx';
import { text } from '../util.ts';
import { useState } from 'react';
import { EventType, CategoryType, OptionType } from '../types.ts';
import { Fab, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import router from '../router.tsx';
import moment from 'moment/moment';

export default function Agenda() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<OptionType | 'all'>('all');

  const exampleAPIResponse: EventType[] = [
    {
      id: '5',
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
      dates: [
        { startDateTime: '2025-03-06T08:30:00.000Z', endDateTime: '2025-04-06T09:30:00.000Z' }
      ],
      registrationOpenTime: '2024-12-23T00:00:00.000Z',
      registrationCloseTime: '2027-03-07T00:00:00.000Z',
      registrationQuestions: [
        { question: { en: 'How many quickdraws', nl: 'Hoeveel setjes' }, required: true }
      ]
    },
    {
      id: '4',
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
      dates: [
        { startDateTime: '2025-03-06T22:30:00.000Z', endDateTime: '2025-03-08T22:30:00.000Z' }
      ],
      registrationOpenTime: '2024-12-23T00:00:00.000Z',
      registrationCloseTime: '2027-03-07T00:00:00.000Z',
      registrationQuestions: [
        { question: { en: 'How many quickdraws', nl: 'Hoeveel setjes' }, required: true }
      ]
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
                  'To register for events you must first log in.',
                  'Om je aan te melden voor evenementen moet je eerst ingelogd zijn.'
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
              <div className="grid gap-3">
                <FormControl fullWidth>
                  <InputLabel id="select-label">{text('Category', 'Categorie')}</InputLabel>
                  <Select
                    labelId="select-label"
                    value={selectedCategory}
                    label={text('Category', 'Categorie')}
                    onChange={(e) => setSelectedCategory(e.target.value as CategoryType | 'all')}
                    variant="outlined">
                    <MenuItem value="all">{text('All', 'Alles')}</MenuItem>
                    <MenuItem value="activity">{text('Activities', 'Activiteiten')}</MenuItem>
                    <MenuItem value="course">{text('Courses', 'Cursussen')}</MenuItem>
                    <MenuItem value="training">{text('Trainings', 'Trainingen')}</MenuItem>
                    <MenuItem value="weekend">{text('Weekends', 'Weekenden')}</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="select-label">{text('Type', 'Type')}</InputLabel>
                  <Select
                    labelId="select-label"
                    value={selectedType}
                    label={text('Type', 'Type')}
                    onChange={(e) => setSelectedType(e.target.value as OptionType | 'all')}
                    variant="outlined">
                    <MenuItem value="all">{text('All', 'Alles')}</MenuItem>
                    <MenuItem value="sp">{text('Single Pitch', 'Single Pitch')}</MenuItem>
                    <MenuItem value="mp">{text('Multi Pitch', 'Multi Pitch')}</MenuItem>
                    <MenuItem value="education">{text('Education', 'Educatie')}</MenuItem>
                    <MenuItem value="boulder">{text('Bouldering', 'Boulderen')}</MenuItem>
                    <MenuItem value="trad">{text('Trad', 'Trad')}</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </ContentCard>
            {exampleAPIResponse
              .filter(
                (event: EventType) =>
                  (selectedCategory === 'all' || event.category === selectedCategory) &&
                  (selectedType === 'all' || event.type.includes(selectedType))
              )
              .sort(
                (a: EventType, b: EventType) =>
                  moment(a.dates[0].startDateTime).valueOf() -
                  moment(b.dates[0].startDateTime).valueOf()
              )
              .map((event: EventType) => (
                <EventCard event={event} agendaPage={true} key={event.id} />
              ))}
          </div>
        </div>
      </GenericPage>
    </>
  );
}
