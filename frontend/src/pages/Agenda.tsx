import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import AgendaCard from '../components/AgendaCard.tsx';
import text from '../util.ts';
import { useState } from 'react';
import { AgendaEventType } from '../types.ts';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Agenda() {
  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const exampleAPIResponse = {
    events: [
      {
        id: 1,
        image: '/images/test-header-image.jpg',
        titleEN: 'Albufeira',
        titleNL: 'Albufeira',
        category: 'weekend',
        locationEN: 'Albufeira',
        locationNL: 'Albufeira',
        descriptionMarkdownEN: 'You must register to participate!',
        descriptionMarkdownNL: 'Je moet je registreren om mee te doen!',
        registrations: 12,
        maxRegistrations: 20,
        startDateTime: '2025-03-06T00:00:00.000Z',
        endDateTime: '2025-03-08T00:00:00.000Z',
        registrationOpenTime: '2023-03-05T00:00:00.000Z',
        registrationCloseTime: '2027-03-07T00:00:00.000Z'
      },
      {
        id: 2,
        image: '/images/test-header-image.jpg',
        titleEN: 'Albufeira',
        titleNL: 'Albufeira',
        category: 'weekend',
        locationEN: 'Albufeira',
        locationNL: 'Albufeira',
        descriptionMarkdownEN: 'No registration required',
        descriptionMarkdownNL: 'Je hoeft je niet in te schrijven',
        registrations: 12,
        maxRegistrations: 0,
        startDateTime: '2025-03-06T00:00:00.000Z',
        endDateTime: '2025-03-08T00:00:00.000Z',
        registrationOpenTime: '2023-03-05T00:00:00.000Z',
        registrationCloseTime: '2027-03-07T00:00:00.000Z'
      },
      {
        id: 3,
        image: '/images/test-header-image.jpg',
        titleEN: 'Albufeira',
        titleNL: 'Albufeira',
        category: 'course',
        locationEN: 'RSC',
        locationNL: 'RSC',
        descriptionMarkdownEN: 'No registration required',
        descriptionMarkdownNL: 'Je hoeft je niet in te schrijven',
        registrations: 12,
        maxRegistrations: 20,
        startDateTime: '2025-03-06T00:00:00.000Z',
        endDateTime: '2025-03-08T00:00:00.000Z',
        registrationOpenTime: '2023-03-05T00:00:00.000Z',
        registrationCloseTime: '2024-03-07T00:00:00.000Z'
      },
      {
        id: 4,
        image: '/images/test-header-image.jpg',
        titleEN: 'Albufeira',
        titleNL: 'Albufeira',
        category: 'course',
        locationEN: 'Climbing Hall',
        locationNL: 'Klimhal',
        descriptionMarkdownEN: 'No registration required',
        descriptionMarkdownNL: 'Je hoeft je niet in te schrijven',
        registrations: 20,
        maxRegistrations: 20,
        startDateTime: '2025-03-06T00:00:00.000Z',
        endDateTime: '2025-03-08T00:00:00.000Z',
        registrationOpenTime: '2023-03-05T00:00:00.000Z',
        registrationCloseTime: '2025-03-07T00:00:00.000Z'
      },
      {
        id: 5,
        image: '/images/test-header-image.jpg',
        titleEN: 'Albufeira',
        titleNL: 'Albufeira',
        category: 'activity',
        locationEN: 'The Yard',
        locationNL: 'De Yard',
        descriptionMarkdownEN: 'No registration required',
        descriptionMarkdownNL: 'Je hoeft je niet in te schrijven',
        registrations: 12,
        maxRegistrations: 20,
        startDateTime: '2025-03-06T22:30:00.000Z',
        endDateTime: '2025-03-06T22:30:00.000Z',
        registrationOpenTime: '2024-12-23T00:00:00.000Z',
        registrationCloseTime: '2027-03-07T00:00:00.000Z'
      }
    ]
  };

  return (
    <>
      <div className="flex justify-end fixed bottom-5 right-5 z-10">
        <Button variant="contained">
          <AddIcon className="mr-2" />
          {text('Add event', 'Voeg event toe')}
        </Button>
      </div>

      <GenericPage>
        <div className="Agenda">
          <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-flow-row gap-5">
            <ContentCard className="lg:col-span-2">
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
            <ContentCard className="xl:col-span-1 lg:col-span-2">
              <h2 className="mb-3">{text('Filter', 'Filteren')}</h2>
              <FormControl fullWidth>
                <InputLabel id="select-label">{text('Category', 'Categorie')}</InputLabel>
                <Select
                  labelId="select-label"
                  value={selectedCategory}
                  label="Category"
                  onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="all">{text('All', 'Alles')}</MenuItem>
                  <MenuItem value="activity">{text('Activities', 'Activiteiten')}</MenuItem>
                  <MenuItem value="course">{text('Courses', 'Cursussen')}</MenuItem>
                  <MenuItem value="training">{text('Trainings', 'Trainingen')}</MenuItem>
                  <MenuItem value="weekend">{text('Weekends', 'Weekenden')}</MenuItem>
                </Select>
              </FormControl>
            </ContentCard>

            {exampleAPIResponse.events
              .filter(
                (e: AgendaEventType) =>
                  selectedCategory === 'all' || e.category === selectedCategory
              )
              .map((event: AgendaEventType) => (
                <AgendaCard {...event} key={event.id} />
              ))}
          </div>
        </div>
      </GenericPage>
    </>
  );
}
