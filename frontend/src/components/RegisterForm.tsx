import {Answer, Language, Question} from '../types.ts';
import {Button, TextField} from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment';
import {useState} from 'react';

interface RegisterFormProps {
  registrationQuestions: Question[];
  title: Language;
  registrationCloseTime: string;
  handleRegistration: (answers: Answer[], update?: boolean) => void;
  existingAnswers?: Answer[];
}

export default function RegisterForm({
  registrationQuestions,
  title,
  registrationCloseTime,
  handleRegistration,
  existingAnswers
}: RegisterFormProps) {
  const { text, language } = useLanguage();
  const [answers, setAnswers] = useState<Answer[]>(
    existingAnswers && existingAnswers.length > 0
      ? existingAnswers
      : registrationQuestions.map((q) => ({
        questionId: q.id,
        answer: '',
      }))
  );
  moment.locale(language);

  return (
    <div className="grid gap-3">
      <h1>
        {text(
          'Registration for ' + title.en,
          'Inschrijving voor ' + title.nl
        )}
      </h1>
      <p>
        <AccessAlarmIcon className=" mr-2" />
        {text('Registrations close at ', 'Inschrijvingen sluiten op ')}
        {moment(registrationCloseTime).format('DD MMM HH:mm')}
      </p>
      {registrationQuestions.map((question, index) => (
        <TextField
          key={index}
          fullWidth
          label={text(question.question.en, question.question.nl)}
          value={answers[index].answer}
          onChange={(e) => {
            const updated = [...answers];
            updated[index].answer = e.target.value;
            setAnswers(updated);
          }}
        />
      ))}
      <Button variant="contained" fullWidth onClick={() => handleRegistration(answers, existingAnswers && existingAnswers.length > 0)}>
        {text(
          existingAnswers ? 'Update Registration' : 'Register',
          existingAnswers ? 'Inschrijving bijwerken' : 'Inschrijven'
        )}
      </Button>
    </div>
  );
}
