import { useLanguage } from '../providers/LanguageProvider.tsx';

import TextCard from './TextCard.tsx';

import GroupIcon from '@mui/icons-material/Group';
import moment from 'moment';

import text from '../util.ts';

import 'moment/dist/locale/nl';
import { CalendarEventType } from '../types.ts';

export default function CalenderCard(props: CalendarEventType) {
  const language = useLanguage();
  const localeCode = language.getLocaleCode();
  const langCode = language.getLangCode();
  moment.locale(langCode);

  const registerButtonInner = (full: boolean) => {
    const button = (inner: string, additionalClasses: string) => (
      <div
        className={`rounded-md border border-[rgba(1,1,1,0.1)] p-[6px_10px] font-medium cursor-pointer select-none dark:bg-[#121212] dark:border-[rgba(255,255,255,0.3)] ${additionalClasses}`}
      >
        {inner}
      </div>
    );

    return full
      ? button(
          text('Full', 'Vol'),
          'bg-lightgray text-[rgba(1,1,1,0.6)] cursor-not-allowed dark:text-[rgba(255,255,255,0.6)]'
        )
      : button(text('Register', 'Aanmelden'), '');
  };

  const registerButton =
    props.registerState == 'register' ? (
      new Date(props.registrationOpenTime) > new Date() ? (
        <p>
          {text('Registration opens at', 'Aanmeldingen openen op')}{' '}
          {new Date(props.registrationOpenTime).toLocaleString(langCode)}
        </p>
      ) : new Date(props.registrationCloseTime) > new Date() ? (
        registerButtonInner(false)
      ) : (
        <p>
          {text('Registrations closed at', 'Aanmeldingen zijn gesloten sinds')}{' '}
          {new Date(props.registrationCloseTime).toLocaleString(langCode)}
        </p>
      )
    ) : props.registerState == 'full' ? (
      registerButtonInner(true)
    ) : props.registerState == 'login' ? (
      <p>{text('You must login to register', 'Je moet inloggen om je aan te melden')}</p>
    ) : (
      <div></div>
    );

  const startDate = new Date(props.startDateTime);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(props.endDateTime);
  endDate.setHours(0, 0, 0, 0);

  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  let dateResultString;

  if (startDate.getTime() === endDate.getTime()) {
    // Show only start date and time
    dateResultString = moment(props.startDateTime).format('DD MMM HH:mm');
  } else if (startMonth === endMonth) {
    // Show start and end date
    dateResultString = `${moment(props.startDateTime).format('D')} - ${moment(props.endDateTime).format('D')} ${moment(props.startDateTime).format('MMM')}`;
  } else {
    // Show start and end date
    dateResultString = `${moment(props.startDateTime).format('D MMM')} - ${moment(props.endDateTime).format('D MMM')}`;
  }

  return (
    <div className="w-full bg-inherit rounded-md border border-[rgba(1,1,1,0.1)] overflow-hidden bg-[#121212] dark:border-[rgba(255,255,255,0.1)] flex flex-col">
      <img className="w-full aspect-[4/3] object-cover" src={props.image}></img>
      <div className="p-5 pt-2.5 border-b border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <TextCard>{props.categoryName[localeCode]}</TextCard>&nbsp;&nbsp;
        <TextCard>{dateResultString}</TextCard>
        <h2>{props.title[localeCode]}</h2>
        <p>{props.descriptionMarkdown[localeCode]}</p>
      </div>
      <div className="p-5 flex justify-between items-center basis-auto grow">
        {props.registerState != 'no-register' ? (
          <div className="flex items-center gap-1.25 mr-5">
            <GroupIcon className="mr-1.5" /> {props.registrations}
          </div>
        ) : (
          <div></div>
        )}
        {registerButton}
      </div>
    </div>
  );
}
