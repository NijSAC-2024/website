import { useLanguage } from '../../providers/LanguageProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import moment from 'moment';
import { Chip } from '@mui/material';
import {getLabel, truncateMarkdown} from '../../util.ts';
import 'moment/dist/locale/nl';
import {DateType, Event} from '../../types.ts';
import Markdown from 'react-markdown';
import RegisterButton from '../register/RegisterButton.tsx';
import {useWebsite} from '../../hooks/useState.ts';

interface AgendaCardProps {
  event: Event;
  agendaPage: boolean;
}

export default function EventCard({ event, agendaPage }: AgendaCardProps) {
  const {navigate} = useWebsite()
  const { text, language } = useLanguage();

  moment.locale(language);

  const formatDate = (date: DateType): string => {

    const start = new Date(date.start);
    const end = new Date(date.end);

    const startDay = start.getDay();
    const endDay = end.getDay();
    const startMonth = start.getMonth();
    const endMonth = end.getMonth();

    if (date.start === date.end) {
      return moment(start).format('DD MMM HH:mm');
    } else if (startDay === endDay) {
      return (
        moment(start).format('DD MMM HH:mm') +
        ' - ' +
        moment(end).format('HH:mm')
      );
    } else if (!agendaPage) {
      return (
        moment(start).format('DD MMM HH:mm') +
        ' - ' +
        moment(end).format('DD MMM HH:mm')
      );
    } else {
      if (startMonth === endMonth) {
        return (
          moment(start).format('DD') + ' - ' + moment(end).format('DD MMM')
        );
      } else {
        return (
          moment(start).format('DD MMM') + ' - ' + moment(end).format('DD MMM')
        );
      }
    }
  };

  let imageUrl = '/images/test-header-image.jpg'
  if (event.image) {
    imageUrl = (event.image?.startsWith('https://') ? event.image : `/api/file/${event.image}`)
  }

  return (
    <div
      className="w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative justify-between">
      <div
        onClick={() => navigate('events.event', { event_id: event.id })}
        className={agendaPage ? 'hover:cursor-pointer' : ''}
      >
        <Chip
          label={formatDate(event.dates[0])}
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
        <img
          className="w-full aspect-[4/2] object-cover"
          src={imageUrl}
          alt="not available"
        />
        <div className="p-5 grid space-y-1">
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-1">
              <Chip
                label={text(getLabel(event.eventType))}
                className="uppercase font-semibold"
                size="small"
              />
              {event.metadata?.type?.map((type) => (
                <Chip
                  key={`${event.id}-${type}`}
                  label={text(getLabel(type))}
                  className="uppercase font-semibold"
                  size="small"
                />
              ))}
            </div>
            <div className="flex items-center">
              <LocationOnIcon className="text-2xl" />
              {event.location.name.en}
            </div>
          </div>
          <h2>{text(event.name.en, event.name.nl)}</h2>
          {agendaPage ? (
            <Markdown>
              {text(
                truncateMarkdown(event.description?.en || '', 120),
                truncateMarkdown(event.description?.nl || '', 120)
              )}
            </Markdown>
          ) : (
            event.dates.length > 1 && (
              <>
                <b>
                  {text(getLabel(event.eventType)) +
                    text(' dates:', ' datums:')}
                </b>
                {event.dates.map((date, index) => (
                  <p key={date.start + index}>{formatDate(date)}</p>
                ))}
              </>
            )
          )}
        </div>
      </div>
      {event.registrationPeriod?.start && event.registrationPeriod?.end && (
        <div
          className="p-5 flex justify-between items-center border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <GroupIcon className="mr-2" />
            <p>
              {event.registrationCount}
              {event.registrationMax && '/' + event.registrationMax}
            </p>
          </div>
          <RegisterButton
            eventId={event.id}
          />
        </div>
      )}

    </div>
  );
}
