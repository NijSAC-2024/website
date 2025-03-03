import { useLanguage } from '../../providers/LanguageProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import moment from 'moment';
import { Chip } from '@mui/material';
import { getLabel, text } from '../../util.ts';
import 'moment/dist/locale/nl';
import { Activity, DateType } from '../../types.ts';
import Markdown from 'react-markdown';
import RegisterButton from '../RegisterButton.tsx';
import { useAppState } from '../../providers/AppStateProvider.tsx';

interface AgendaCardProps {
  activity: Activity;
  agendaPage: boolean;
}

export default function ActivityCard({ activity, agendaPage }: AgendaCardProps) {
  const { navigate } = useAppState();
  const { language: lang } = useLanguage();
  moment.locale(lang);

  console.log('activity: ', activity);

  const formatDate = (date: DateType): string => {
    moment.locale(lang);

    const start = new Date(date.start);
    const end = new Date(date.end);

    const startDay = start.getDay();
    const endDay = end.getDay();
    const startMonth = start.getMonth();
    const endMonth = end.getMonth();

    if (start === end) return moment(start).utc().format('DD MMM HH:mm');
    else if (startDay === endDay) {
      return (
        moment(start).utc().format('DD MMM HH:mm') +
        ' - ' +
        moment(end).utc().format('HH:mm')
      );
    } else if (!agendaPage) {
      return (
        moment(start).utc().format('DD MMM HH:mm') +
        ' - ' +
        moment(end).utc().format('DD MMM HH:mm')
      );
    } else {
      if (startMonth === endMonth) {
        return moment(start).format('DD') + ' - ' + moment(end).format('DD MMM');
      } else {
        return (
          moment(start).format('DD MMM') + ' - ' + moment(end).format('DD MMM')
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
    <div
      className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative justify-between">
      <div
        onClick={() => navigate('activity', { id: activity.id })}
        className={agendaPage ? 'hover:cursor-pointer' : ''}
      >
        <Chip
          label={formatDate(activity.dates[0])}
          className="absolute uppercase font-semibold top-5 right-5"
          color="primary"
          sx={{ fontSize: 16 }}
        />
        {agendaPage && !activity.isPublished && (
          <Chip
            label={text(lang, 'Draft', 'Concept')}
            className="absolute uppercase font-semibold top-5 left-5"
            color="primary"
          />
        )}
        <img className="w-full aspect-[4/2] object-cover" src={activity.image} alt="not available" />
        <div className="p-5 grid space-y-1">
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-1">
              <Chip
                label={text(lang, getLabel(activity.activityType))}
                className="uppercase font-semibold"
                size="small"
              />
              {activity.metadata?.type?.map((type) => (
                <Chip
                  key={`${activity.id}-${type}`}
                  label={text(lang, getLabel(type))}
                  className="uppercase font-semibold"
                  size="small"
                />
              ))}
            </div>
            <div className="flex items-center">
              <LocationOnIcon className="text-2xl" />
              {activity.location.name.en}
            </div>
          </div>
          <h2>{text(lang, activity.name.en, activity.name.nl)}</h2>
          {agendaPage ? (
            <Markdown>
              {text(
                lang,
                truncateMarkdown(activity.description?.en, 120),
                truncateMarkdown(activity.description?.nl, 120)
              )}
            </Markdown>
          ) : (
            activity.dates.length > 1 && (
              <>
                <b>{text(lang, getLabel(activity.activityType)) + text(lang, ' dates:', ' datums:')}</b>
                {activity.dates.map((date) => (
                  <p>{formatDate(date)}</p>
                ))}
              </>
            )
          )}
        </div>
        {activity.registrationPeriod?.start && activity.registrationPeriod?.end && (
          <div
            className="p-5 flex justify-between items-center border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center">
              <GroupIcon className="mr-2" />
              <p>
                {activity.registrationCount}
                {activity.registrationMax && '/' + activity.registrationMax}
              </p>
            </div>
            <RegisterButton
              registrationCloseTime={activity.registrationPeriod?.end}
              registrationOpenTime={activity.registrationPeriod?.start}
              title={activity.name}
              questions={activity.questions}
              registrationMax={activity.registrationMax}
              registrationCount={activity.registrationCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
