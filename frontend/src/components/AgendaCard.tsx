import { useLanguage } from '../providers/LanguageProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import moment from 'moment';
import { Chip } from '@mui/material';
import { text, formatDate, truncateMarkdown, getLabel } from '../util.ts';
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
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  moment.locale(langCode);

  return (
    <div className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative justify-between">
      <div
        onClick={() => router.navigate('/agenda/' + agendaEvent.id)}
        className="hover:cursor-pointer"
      >
        {agendaPage && (
          <Chip
            label={formatDate(agendaEvent.startDateTime, agendaEvent.endDateTime)}
            className="absolute uppercase font-semibold top-5 right-5"
            color="primary"
            sx={{ fontSize: 16 }}
          />
        )}
        <img
          className="w-full aspect-[4/2] object-cover"
          src={agendaEvent.image}
          alt="not available"
        />
        <div className="p-5 grid space-y-1">
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-1">
              <Chip
                label={text(getLabel(agendaEvent.category).en, getLabel(agendaEvent.category).nl)}
                className="uppercase font-semibold"
                size="small"
              />
              {agendaEvent.type.map((type, index) => (
                <Chip
                  key={index}
                  label={text(getLabel(type).en, getLabel(type).nl)}
                  className="uppercase font-semibold"
                  size="small"
                />
              ))}
            </div>
            <div className="flex items-center">
              <LocationOnIcon className="text-2xl" />
              {agendaEvent.location}
            </div>
          </div>
          <h2>{text(agendaEvent.title.en, agendaEvent.title.nl)}</h2>
          {agendaPage ? (
            <Markdown>
              {text(
                truncateMarkdown(agendaEvent.descriptionMarkdown.en, 120),
                truncateMarkdown(agendaEvent.descriptionMarkdown.nl, 120)
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
      {agendaEvent.allowsRegistrations && (
        <div className="p-5 flex justify-between items-center border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <GroupIcon className="mr-2" /> {agendaEvent.numberOfRegistrations}
          </div>
          <RegisterButton agendaEvent={agendaEvent} />
        </div>
      )}
    </div>
  );
}
