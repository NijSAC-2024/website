import { useLanguage } from '../providers/LanguageProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import moment from 'moment';
import { Chip } from '@mui/material';
import { text, getLabel } from '../util.ts';
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

  const formatDate = (startDateTime: string, endDateTime: string): string => {
    const { getLangCode } = useLanguage();
    const langCode = getLangCode();
    moment.locale(langCode);

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const startDay = startDate.getDay() + 1;
    const endDay = endDate.getDay() + 1;
    const startMonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;

    if (startDateTime === endDateTime) return moment(startDateTime).utc().format('DD MMM HH:mm');
    else if (startDay === endDay) {
      return (
        moment(startDateTime).utc().format('DD MMM HH:mm') +
        ' - ' +
        moment(endDateTime).utc().format('HH:mm')
      );
    } else if (!agendaPage) {
      return (
        moment(startDateTime).utc().format('DD MMM HH:mm') +
        ' - ' +
        moment(endDateTime).utc().format('DD MMM HH:mm')
      );
    } else {
      if (startMonth === endMonth) {
        return moment(startDateTime).format('DD') + ' - ' + moment(endDateTime).format('DD MMM');
      } else {
        return (
          moment(startDateTime).format('DD MMM') + ' - ' + moment(endDateTime).format('DD MMM')
        );
      }
    }
  };

  const truncateMarkdown = (markdown: string, maxLength: number): string => {
    if (markdown.length <= maxLength) return markdown;

    let truncated = markdown.slice(0, maxLength);
    const lastCut = Math.max(truncated.lastIndexOf(' '), truncated.lastIndexOf('\n'));
    truncated = lastCut > -1 ? truncated.slice(0, lastCut) : truncated;

    const unmatchedTags = (truncated.match(/(\*\*|\*|_|`)/g) || []).length % 2;
    if (unmatchedTags) {
      truncated = truncated.slice(
        0,
        truncated.lastIndexOf((truncated.match(/(\*\*|\*|_|`)/g) || []).pop()!)
      );
    }
    return truncated.trim() + '…';
  };

  return (
    <div className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative justify-between">
      <div
        onClick={() => router.navigate('/agenda/' + agendaEvent.id)}
        className="hover:cursor-pointer"
      >
        <Chip
          label={formatDate(agendaEvent.startDateTime, agendaEvent.endDateTime)}
          className="absolute uppercase font-semibold top-5 right-5"
          color="primary"
          sx={{ fontSize: 16 }}
        />
        <img
          className="w-full aspect-4/2 object-cover"
          src={agendaEvent.image}
          alt="not available"
        />
        <div className="p-5 grid space-y-1">
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-1">
              <Chip
                label={text(getLabel(agendaEvent.category))}
                className="uppercase font-semibold"
                size="small"
              />
              {agendaEvent.type.map((type, index) => (
                <Chip
                  key={`${agendaEvent.id}-${index}`}
                  label={text(getLabel(type))}
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
          {agendaPage && (
            <Markdown>
              {text(
                truncateMarkdown(agendaEvent.descriptionMarkdown.en, 120),
                truncateMarkdown(agendaEvent.descriptionMarkdown.nl, 120)
              )}
            </Markdown>
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
