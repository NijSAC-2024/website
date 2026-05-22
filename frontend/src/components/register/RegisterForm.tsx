import {Answer, ErrorType, Language, Question, Registration} from '../../types.ts';
import {
  Box,
  Button,
  FormControl,
  Checkbox,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import moment from 'moment';
import {FormEvent, useState} from 'react';
import {emailValidator} from '../../validator.ts';
import {useAuth} from '../../providers/AuthProvider.tsx';

interface RegisterFormProps {
  registrationQuestions: Question[];
  handleRegistration: (answers: Answer[], guestName?: string, guestEmail?: string) => void;
  registration?: Registration;
}

export default function RegisterForm({
  registrationQuestions,
  handleRegistration,
  registration
}: RegisterFormProps) {
  const {text, language} = useLanguage();
  const {user} = useAuth();
  const requireGuestName = !user || !!registration?.guestEmail

  const now = new Date()
  const [answers, setAnswers] = useState<Answer[]>(
    registrationQuestions.map((q) => {
      const existingAnswer = registration?.answers?.find(
        (a) => a.questionId === q.id
      );
      return (
        existingAnswer ?? {
          questionId: q.id,
          answer:
            q.questionType.type === 'boolean'
              ? 'false'
              : q.questionType.type === 'date'
                ? now.toISOString()
                : ''
        }
      );
    })
  );


  const [errors, setErrors] = useState<ErrorType[]>(Array(registrationQuestions.length).fill(false));
  const [guestName, setGuestName] = useState<string | undefined>(registration?.firstName);
  const [guestEmail, setGuestEmail] = useState<string | undefined>(registration?.guestEmail);
  const [guestNameError, setGuestNameError] = useState<ErrorType>(false);
  const [guestEmailError, setGuestEmailError] = useState<ErrorType>(false);
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
    if (requireGuestName && guestName?.trim() === '') {
      setGuestNameError({
        en: 'This field is required',
        nl: 'Dit veld is verplicht'
      });
    } else {
      setGuestNameError(false);
    }
    if (requireGuestName && guestEmail?.trim() === '') {
      setGuestEmailError({
        en: 'This field is required',
        nl: 'Dit veld is verplicht'
      });
    } else if (requireGuestName && guestEmail) {
      setGuestEmailError(emailValidator(guestEmail));
    } else {
      setGuestEmailError(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (Object.values(errors).some((v) => v) || !!guestNameError || !!guestEmailError) {
      return;
    }
    handleRegistration(answers.filter(answer => answer.answer.trim() !== ''), guestName, guestEmail);
  }

  return (
    <Box className="grid gap-3" component="form" onSubmit={handleSubmit}>
      {requireGuestName && (
        <>
          <FormControl fullWidth>
            <TextField
              label={`${text('Name', 'Naam')} *`}
              value={guestName}
              onChange={(event) => {
                setGuestName(event.target.value);
              }}
              error={!!guestNameError}
              helperText={guestNameError && text(guestNameError as Language)}
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              label={`${text('Email', 'Email')} *`}
              value={guestEmail}
              onChange={(event) => {
                setGuestEmail(event.target.value);
              }}
              error={!!guestEmailError}
              helperText={guestEmailError && text(guestEmailError as Language)}
              fullWidth
            />
          </FormControl>
        </>
      )}
      {registrationQuestions.map((question, index) => {
        const label = `${text(question.question.en, question.question.nl)}${question.required ? ' *' : ''}`;
        const error = errors[index];
        const answer = answers[index]

        switch (question.questionType.type) {
        case 'text':
          return (
            <FormControl key={question.id} fullWidth>
              <TextField
                label={label}
                value={answer?.answer}
                onChange={(e) => {
                  const updated = [...answers];
                  updated[index].answer = e.target.value;
                  setAnswers(updated);
                }}
                error={!!error}
                helperText={error && text(error as Language)}
                fullWidth
              />
            </FormControl>
          );

        case 'number':
          return (
            <FormControl key={question.id} fullWidth>
              <TextField
                label={label}
                type="number"
                value={answer?.answer}
                onChange={(e) => {
                  const updated = [...answers];
                  updated[index].answer = e.target.value;
                  setAnswers(updated);
                }}
                error={!!error}
                helperText={error && text(error as Language)}
                fullWidth
              />
            </FormControl>
          );

        case 'multipleChoice':
          return (
            <FormControl key={question.id} fullWidth>
              <Select
                value={answer?.answer}
                displayEmpty
                onChange={(e) => {
                  const updated = [...answers];
                  updated[index].answer = e.target.value;
                  setAnswers(updated);
                }}
                error={!!error}
              >
                <MenuItem value="" disabled>
                  {label}
                </MenuItem>
                {(question.questionType.options ?? []).map((opt, i) => (
                  <MenuItem key={i} value={opt[language]}>
                    {text(opt.en, opt.nl)}
                  </MenuItem>
                ))}
              </Select>
              {error && (
                <span className="text-red-500 text-xs ml-3">
                  {text(error as Language)}
                </span>
              )}
            </FormControl>
          );

        case 'date':
          return (
            <DateTimePicker
              key={question.id}
              label={label}
              value={moment(answer?.answer)}
              onChange={(date) => {
                const updated = [...answers];
                updated[index].answer = date ? date.toISOString() : '';
                setAnswers(updated);
              }}
            />
          );

        case 'boolean':
          return (
            <FormControl key={question.id} fullWidth error={!!error}>
              <div
                className="flex items-center justify-between border border-[#c4c4c4] dark:border-[#4c4c4c] rounded-xl pl-3 py-1.5">
                {label}
                <Checkbox
                  checked={answer?.answer === 'true'}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[index].answer = e.target.checked ? 'true' : 'false';
                    setAnswers(updated);
                  }}
                />
              </div>
            </FormControl>
          );

        default:
          return null;
        }
      })}

      <Button
        variant="contained"
        type="submit"
        fullWidth
        onClick={validateInputs}
      >
        {text(
          registration ? 'Update Registration' : 'Register',
          registration ? 'Inschrijving bijwerken' : 'Inschrijven'
        )}
      </Button>
    </Box>
  );
}
