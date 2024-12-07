import { useLanguage } from '../providers/LanguageProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import moment from 'moment';
import { Chip } from '@mui/material';
import { text, formatDate, truncateMarkdown } from '../util.ts';
import 'moment/dist/locale/nl';
import { AgendaEventType } from '../types.ts';
import router from '../router.tsx';
import Markdown from 'react-markdown';
import RegisterButton from './RegisterButton.tsx';

interface AgendaCardProps {
  agendaEvent: AgendaEventType;
  agendaPage: boolean;
}

export default function AgendaCard({ agendaEvent, agendaPage }: AgendaCardProps) {
  const language = useLanguage();
  const langCode = language.getLangCode();
  moment.locale(langCode);

  return (
    <div className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative">
      <div
        onClick={() => router.navigate('/agenda/' + agendaEvent.id)}
        className="hover:cursor-pointer"
      >
        {agendaPage && (
          <Chip
            label={formatDate(agendaEvent.startDateTime, agendaEvent.endDateTime)}
            className="absolute top-5 right-5"
            color="primary"
            sx={{ 'font-size': 18 }}
          />
        )}
        <img
          className="w-full aspect-[4/2] object-cover"
          src={agendaEvent.image}
          alt="not available"
        />
        <div className="p-5 pt-2.5">
          <div className="flex justify-between space-x-2">
            <Chip label="weekend" className="uppercase font-semibold" size="small" />
            <div className="flex items-center">
              <LocationOnIcon className="text-2xl" />
              {text(agendaEvent.locationEN, agendaEvent.locationNL)}
            </div>
          </div>
          <h2>{text(agendaEvent.titleEN, agendaEvent.titleNL)}</h2>
          {agendaPage ? (
            <Markdown>
              {text(
                truncateMarkdown(agendaEvent.descriptionMarkdownEN, 120),
                truncateMarkdown(agendaEvent.descriptionMarkdownNL, 120)
              )}
            </Markdown>
          ) : (
            <p>
              <Chip
                label={moment(agendaEvent.startDateTime).format('DD MMM HH:mm')}
                className="uppercase font-semibold"
                color="primary"
              />
              {' - '}
              <Chip
                label={moment(agendaEvent.endDateTime).format('DD MMM HH:mm')}
                className="uppercase font-semibold"
                color="primary"
              />
            </p>
          )}
        </div>
      </div>
      {agendaEvent.maxRegistrations !== 0 && (
        <div className="p-5 flex justify-between items-center grow border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <GroupIcon className="mr-2" /> {agendaEvent.numberOfRegistrations}
          </div>
          <RegisterButton agendaEvent={agendaEvent} langCode={langCode} />
        </div>
      )}
    </div>
  );
}
