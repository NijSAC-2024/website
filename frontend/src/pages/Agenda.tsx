import {useState} from 'react';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import { Event, EventType, WeekendType } from '../types.ts';
import { Fab, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from '../components/Link.tsx';
import EventCard from '../components/event/EventCard.tsx';
import { useApiState } from '../providers/ApiProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import {useAuth} from '../providers/AuthProvider.tsx';

export default function Agenda() {
  const { text } = useLanguage();
  const { events, registeredEvents } = useApiState();
  const { isLoggedIn, user}= useAuth()
  const [selectedCategory, setSelectedCategory] = useState<EventType | 'all'>(
    'all'
  );
  const [selectedType, setSelectedType] = useState<WeekendType | 'all'>('all');

  return (
    <>
      {isLoggedIn && user?.roles.includes('admin') && (
        <div className="fixed bottom-5 right-5 z-10">
          <Link routeName={'new_event'}>
            <Fab variant="extended" color="primary">
              <AddIcon className="mr-2" />
              <p>{text('Add event', 'Voeg evenement toe')}</p>
            </Fab>
          </Link>
        </div>
      )}
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
                  <InputLabel id="select-label">
                    {text('Category', 'Categorie')}
                  </InputLabel>
                  <Select
                    labelId="select-label"
                    value={selectedCategory}
                    label={text('Category', 'Categorie')}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as EventType | 'all')
                    }
                    variant="outlined"
                  >
                    <MenuItem value="all">
                      {text('All', 'Alles')}
                    </MenuItem>
                    <MenuItem value="activity">
                      {text('Activities', 'Activiteiten')}
                    </MenuItem>
                    <MenuItem value="course">
                      {text('Courses', 'Cursussen')}
                    </MenuItem>
                    <MenuItem value="training">
                      {text('Trainings', 'Trainingen')}
                    </MenuItem>
                    <MenuItem value="weekend">
                      {text('Weekends', 'Weekenden')}
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="select-label">
                    {text('Type', 'Type')}
                  </InputLabel>
                  <Select
                    labelId="select-label"
                    value={selectedType}
                    label={text('Type', 'Type')}
                    onChange={(e) =>
                      setSelectedType(e.target.value as WeekendType | 'all')
                    }
                    variant="outlined"
                  >
                    <MenuItem value="all">
                      {text('All', 'Alles')}
                    </MenuItem>
                    <MenuItem value="sp">
                      {text('Single Pitch', 'Single Pitch')}
                    </MenuItem>
                    <MenuItem value="mp">
                      {text('Multi Pitch', 'Multi Pitch')}
                    </MenuItem>
                    <MenuItem value="education">
                      {text('Education', 'Educatie')}
                    </MenuItem>
                    <MenuItem value="boulder">
                      {text('Bouldering', 'Boulderen')}
                    </MenuItem>
                    <MenuItem value="trad">
                      {text('Trad', 'Trad')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </ContentCard>
            {events &&
              events.filter(
                (event: Event) =>
                  (selectedCategory === 'all' ||
                    event.eventType === selectedCategory) &&
                  (selectedType === 'all' ||
                    event.metadata?.type?.includes(selectedType))
              ).sort(
                (a: Event, b: Event) =>
                  new Date(a.dates[0].start).valueOf() - new Date(b.dates[0].start).valueOf()
              ).map((event: Event) => (
                <EventCard key={event.id} event={event} agendaPage={true} isRegistered={!!user && registeredEvents.includes(event.id)} />
              ))}
          </div>
        </div>
      </GenericPage>
    </>
  );
}
