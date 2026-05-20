import {useLanguage} from '../providers/LanguageProvider.tsx';
import {Button, Fab, Switch} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GenericPage from './GenericPage.tsx';
import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import {isAdminOrBoard, isChair} from '../util.ts';
import {useCommitteeHook} from '../hooks/useCommitteeHook.ts';
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '../providers/AuthProvider.tsx';
import LoadingPage from '../components/loading/LoadingPage.tsx';
import CommitteeMembers from '../components/committee/CommitteeMembers.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {useState} from 'react';
import {useEventHook} from '../hooks/useEventHook.ts';
import {Event} from '../types.ts';
import moment from 'moment/moment';
import EventCard from '../components/event/EventCard.tsx';

export default function Committee() {
  const {text} = useLanguage();
  const {committeeId} = useParams();
  const {user} = useAuth();
  const {useCommittee, useCommitteeMembers} = useCommitteeHook();
  const committee = useCommittee(committeeId);
  const committeeMembers = useCommitteeMembers(committeeId)
  const [filterPastEvents, setFilterPastEvents] = useState<boolean>(false);
  const navigate = useNavigate();
  const {useEvents} = useEventHook();
  const events = useEvents();
  const now = new Date();

  if (!committee) {
    return <LoadingPage/>;
  }

  const filteredEvents =
    ((events ?? []) as unknown as Event[]).filter((event) =>
      (filterPastEvents ||
        moment(event.dates[0].start).isAfter(moment(now))) && event.createdBy === committeeId
    );


  let imageUrl = '/images/test-header-image.jpg';
  if (committee.image) {
    imageUrl = (committee.image?.startsWith('https://') ? committee.image : `/api/file/${committee.image}`);
  }

  return (
    <>
      {user && (isChair(committeeMembers, user.id) || isAdminOrBoard(user.roles)) && (
        <div className="fixed bottom-5 right-5 z-10">
          <Fab
            variant="extended"
            color="primary"
            onClick={() => navigate(`/committees/${committee.id}/edit`)}
          >
            <EditIcon className="mr-2"/>
            {text('Edit committee', 'Commissie bewerken')}
          </Fab>
        </div>
      )}

      <GenericPage image={imageUrl}>
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="xl:absolute xl:z-50 xl:-mt-[3.3rem] -mb-2 lg:col-span-2 xl:col-span-3">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button color="inherit" onClick={() => navigate('/committees')}>
                {text('Back to Committees', 'Terug naar Commissies')}
              </Button>
            </div>
          </div>

          {/* Committee Info */}
          <div
            className="w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] xl:col-span-2 border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] h-full">
            <img
              className="w-full aspect-4/2 object-cover"
              src={imageUrl}
              alt="not available"
            />
            <div className="p-5 grid gap-1">
              <h1 className="text-3xl font-bold">
                {text(committee.name?.en, committee.name.nl)}
              </h1>
              <Markdown remarkPlugins={[remarkGfm]}>
                {text(committee.description?.en || '', committee.description?.nl || '')}
              </Markdown>
            </div>
          </div>

          {/* Committee Members */}
          <CommitteeMembers/>

          {/* Committee Events */}
          <ContentCard className="xl:col-span-3 flex justify-between">
            <div className="grid xl:grid-cols-2 justify-between">
              <h1>{text('Organised events', 'Geörganiseerde evenementen')}</h1>
              <div className="flex items-center xl:justify-end">
                <p>{text('Include past events', 'Plaatsgevonden evenementen meenemen')}</p>
                <Switch
                  checked={filterPastEvents}
                  onChange={(_, checked) => setFilterPastEvents(checked)}
                />
              </div>
            </div>
          </ContentCard>
          {filteredEvents.map((event: Event) => (
            <EventCard
              key={event.id}
              event={event}
              agendaPage={true}
            />
          ))}
        </div>
      </GenericPage>
    </>
  );
}
