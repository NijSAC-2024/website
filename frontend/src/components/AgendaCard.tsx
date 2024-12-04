import { useLanguage } from '../providers/LanguageProvider.tsx';
import TextCard from './TextCard.tsx';

import GroupIcon from '@mui/icons-material/Group';
import moment from 'moment';
import { Button } from '@mui/material';

import text from '../util.ts';
import 'moment/dist/locale/nl';
import { AgendaEventType } from '../types.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import router from '../router.tsx';

function getRegisterButton(agendaEvent: AgendaEventType, isLoggedIn: boolean, langCode: string) {
  if (!isLoggedIn) {
    return <p>Please log in to register.</p>;
  }

  if (agendaEvent.registrations === agendaEvent.maxRegistrations) {
    return (
      <Button variant="contained" disabled>
        Full
      </Button>
    );
  }

  const now = new Date();
  const registrationOpenTime = new Date(agendaEvent.registrationOpenTime);
  const registrationCloseTime = new Date(agendaEvent.registrationCloseTime);

  if (registrationOpenTime > now) {
    return (
      <p>
        {text('Registration opens at', 'Aanmeldingen openen op')}{' '}
        {registrationOpenTime.toLocaleString(langCode)}
      </p>
    );
  }

  if (registrationCloseTime > now) {
    return <Button variant="contained">{text('Register', 'Aanmelden')}</Button>;
  }
  return (
    <p>
      {text('Registrations closed at', 'Aanmeldingen zijn gesloten sinds')}{' '}
      {registrationCloseTime.toLocaleString(langCode)}
    </p>
  );
}

function formatDate(startDateTime: string, endDateTime: string): string {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  const startDay = startDate.getDay() + 1;
  const endDay = endDate.getDay() + 1;
  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  if (startDay === endDay) {
    return moment(startDateTime).format('DD MMM HH:mm');
  } else if (startMonth === endMonth) {
    return `${moment(startDateTime).format('DD')} - ${moment(endDateTime).format('DD MMM')}`;
  } else {
    return `${moment(startDateTime).format('DD MMM')} - ${moment(endDateTime).format('DD MMM')}`;
  }
}

export default function AgendaCard(agendaEvent: AgendaEventType) {
  const { isLoggedIn } = useAuth();
  const language = useLanguage();
  const langCode = language.getLangCode();
  moment.locale(langCode);

  const registerButton = getRegisterButton(agendaEvent, isLoggedIn, langCode);

  return (
    <div
      className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative hover:cursor-pointer"
      onClick={() => router.navigate('/agenda/' + agendaEvent.id)}
    >
      <div className="absolute top-2 right-2 bg-[#1976d2] text-white dark:text-black dark:bg-[#90caf9] px-3 py-1 rounded-xl">
        {formatDate(agendaEvent.startDateTime, agendaEvent.endDateTime)}
      </div>
      <img
        className="w-full aspect-[4/2] object-cover"
        src={agendaEvent.image}
        alt="not available"
      />
      <div className="p-5 pt-2.5">
        <div className="space-x-2">
          <TextCard>Weekend</TextCard>
          <TextCard>{text(agendaEvent.locationEN, agendaEvent.locationNL)}</TextCard>
        </div>
        <h2>{text(agendaEvent.titleEN, agendaEvent.titleNL)}</h2>
        <p>{text(agendaEvent.descriptionMarkdownEN, agendaEvent.descriptionMarkdownNL)}</p>
      </div>
      {agendaEvent.maxRegistrations !== 0 && (
        <div className="p-5 flex justify-between items-center grow border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <GroupIcon className="mr-2" /> {agendaEvent.registrations}
          </div>
          {registerButton}
        </div>
      )}
    </div>
  );
}
