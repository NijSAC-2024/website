import { useLanguage } from '../../providers/LanguageProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import moment from 'moment';
import { Chip } from '@mui/material';
import { text, getLabel } from '../../util.ts';
import 'moment/dist/locale/nl';
import { EventType } from '../../types.ts';
import router from '../../router.tsx';
import Markdown from 'react-markdown';
import RegisterButton from '../RegisterButton.tsx';

interface AgendaCardProps {
  event: EventType;
  agendaPage: boolean;
}

export default function EventCard({ event, agendaPage }: AgendaCardProps) {
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
        onClick={() => router.navigate()}
        className={agendaPage ? 'hover:cursor-pointer' : ''}
      >
        <Chip
          label={formatDate(event.dates[0].startDateTime, event.dates[0].endDateTime)}
          className="absolute uppercase font-semibold top-5 right-5"
          color="primary"
          sx={{ fontSize: 16 }}
        />
        {agendaPage && !event.isPublished && (
          <Chip
            label={text('Draft', 'Concept')}
            className="absolute uppercase font-semibold top-5 left-5"
            color="primary"
          />
        )}
        <img className="w-full aspect-[4/2] object-cover" src={event.image} alt="not available" />
        <div className="p-5 grid space-y-1">
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-1">
              <Chip
                label={text(getLabel(event.activityType))}
                className="uppercase font-semibold"
                size="small"
              />
              {event.type.map((type, index) => (
                <Chip
                  key={`${event.id}-${index}`}
                  label={text(getLabel(type))}
                  className="uppercase font-semibold"
                  size="small"
                />
              ))}
            </div>
            <div className="flex items-center">
              <LocationOnIcon className="text-2xl" />
              {event.location}
            </div>
          </div>
          <h2>{text(event.title.en, event.title.nl)}</h2>
          {agendaPage ? (
            <Markdown>
              {text(
                truncateMarkdown(event.descriptionMarkdown.en, 120),
                truncateMarkdown(event.descriptionMarkdown.nl, 120)
              )}
            </Markdown>
          ) : (
            event.dates.length > 1 && (
              <>
                <b>{text(getLabel(event.activityType)) + text(' dates:', ' datums:')}</b>
                {event.dates.map((date, index) => (
                  <p key={index}>{formatDate(date.startDateTime, date.endDateTime)}</p>
                ))}
              </>
            )
          )}
        </div>
      </div>
      {event.registrationOpenTime && event.registrationCloseTime && event.allowsRegistrations && (
        <div className="p-5 flex justify-between items-center border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <GroupIcon className="mr-2" />
            <p>
              {event.numberOfRegistrations}
              {event.hasMaxRegistration && '/' + event.maxRegistrations}
            </p>
          </div>
          <RegisterButton
            registrationCloseTime={event.registrationCloseTime}
            registrationOpenTime={event.registrationOpenTime}
            title={event.title}
            registrationQuestions={event.registrationQuestions}
            maxRegistrations={event.maxRegistrations}
            numberOfRegistrations={event.numberOfRegistrations}
          />
        </div>
      )}
    </div>
  );
}
