import {Answer, ErrorType, Language, Question} from '../../types.ts';
import {Box, Button, FormControl, TextField} from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import moment from 'moment';
import {FormEvent, useState} from 'react';

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
  const [errors, setErrors] = useState<ErrorType[]>(Array(registrationQuestions.length).fill(false));
  moment.locale(language);

  const validateInputs = () => {
    const newErrors: ErrorType[] = registrationQuestions.map((question, index) => {
      const answer = answers[index];

      if (question.required && (!answer || answer.answer.trim() === '')) {
        return {
          en: 'This field is required',
          nl: 'Dit veld is verplicht'
        };
      }

      return false;
    });

    setErrors(newErrors);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (Object.values(errors).some((v)=> v)) {
      return;
    }
    handleRegistration(answers, existingAnswers && existingAnswers.length > 0);
  }

  return (
    <Box className="grid gap-3" component="form" onSubmit={handleSubmit}>
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
        <FormControl>
          <TextField
            key={index}
            fullWidth
            label={`${text(question.question.en, question.question.nl)} ${question.required && '*'}`}
            value={answers[index].answer}
            onChange={(e) => {
              const updated = [...answers];
              updated[index].answer = e.target.value;
              setAnswers(updated);
            }}
            error={!!errors[index]}
            helperText={errors[index] && text(errors[index] as Language)}
          />
        </FormControl>
      ))}
      <Button
        variant="contained"
        type="submit"
        fullWidth
        onClick={validateInputs}
      >
        {text(
          existingAnswers ? 'Update Registration' : 'Register',
          existingAnswers ? 'Inschrijving bijwerken' : 'Inschrijven'
        )}
      </Button>

    </Box>
  );
}
