import { Language, Question } from '../types.ts';
import { text } from '../util.ts';
import { Button, TextField } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment';

interface RegisterFormProps {
  registrationQuestions: Question[];
  title: Language;
  registrationCloseTime: string;
}

export default function RegisterForm({
  registrationQuestions,
  title,
  registrationCloseTime
}: RegisterFormProps) {
  const { language: lang } = useLanguage();
  moment.locale(lang);

  return (
    <div className="grid gap-3">
      <h1>{text(lang, 'Registration for ' + title.en, 'Inschrijving voor ' + title.nl)}</h1>
      <p>
        <AccessAlarmIcon className=" mr-2" />
        {text(lang, 'Registrations close at ', 'Inschrijvingen sluiten op ')}
        {moment(registrationCloseTime).format('DD MMM HH:mm')}
      </p>
      {registrationQuestions.map((question, index) => (
        <TextField
          key={index}
          fullWidth
          label={text(lang, question.question.en, question.question.nl)}
        />
      ))}
      <Button variant="contained" fullWidth>
        {text(lang, 'Register', 'Inschrijven')}
      </Button>
    </div>
  );
}
