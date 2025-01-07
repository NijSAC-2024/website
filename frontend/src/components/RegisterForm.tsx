import { AgendaEventType } from '../types.ts';
import { text } from '../util.ts';
import { Button, TextField } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment';

interface RegisterFormProps {
  agendaEvent: AgendaEventType;
}

export default function RegisterForm({ agendaEvent }: RegisterFormProps) {
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  moment.locale(langCode);

  return (
    <div className="grid gap-3">
      <h1>
        {text(
          'Registration for ' + agendaEvent.title.en,
          'Inschrijving voor ' + agendaEvent.title.nl
        )}
      </h1>
      <p>
        <AccessAlarmIcon className=" mr-2" />
        {text('Registrations close at ', 'Inschrijvingen sluiten op ')}
        {moment(agendaEvent.registrationOpenTime).format('DD MMM HH:mm')}
      </p>
      {agendaEvent.registrationFields.map((field, index) => (
        <TextField key={index} fullWidth label={text(field.en, field.nl)} />
      ))}
      <Button variant="contained" fullWidth>
        {text('Register', 'Inschrijven')}
      </Button>
    </div>
  );
}
