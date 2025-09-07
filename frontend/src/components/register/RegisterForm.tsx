import {Answer, ErrorType, Language, Question} from '../../types.ts';
import {
  Box,
  Button,
  FormControl,
  Checkbox,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import moment from 'moment';
import {FormEvent, useState} from 'react';

interface RegisterFormProps {
  registrationQuestions: Question[];
  handleRegistration: (answers: Answer[]) => void;
  existingAnswers?: Answer[];
}

export default function RegisterForm({
  registrationQuestions,
  handleRegistration,
  existingAnswers
}: RegisterFormProps) {
  const { text, language } = useLanguage();
  const now =  new Date()
  const [answers, setAnswers] = useState<Answer[]>(
    existingAnswers && existingAnswers.length > 0
      ? existingAnswers
      : registrationQuestions.map((q) => ({
        questionId: q.id,
        answer:
          q.questionType.type === 'boolean' ? 'false' :
            q.questionType.type === 'date' ? now.toISOString() :
              ''
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
    handleRegistration(answers);
  }

  return (
    <Box className="grid gap-3" component="form" onSubmit={handleSubmit}>
      {registrationQuestions.map((question, index) => {
        const label = `${text(question.question.en, question.question.nl)}${question.required ? ' *' : ''}`;
        const error = errors[index];
        const answer = answers[index];

        switch (question.questionType.type) {
        case 'text':
          return (
            <FormControl key={question.id} fullWidth>
              <TextField
                label={label}
                value={answer.answer}
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
                value={answer.answer}
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
                value={answer.answer}
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
              label={`${text(question.question.en, question.question.nl)} ${question.required ? '*' : ''}`}
              value={moment(answer.answer)}
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
              <div className="flex items-center justify-between border border-[#c4c4c4] dark:border-[#4c4c4c] rounded-xl pl-3 py-1.5">
                {label}
                <Checkbox
                  checked={answer.answer === 'true'}
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
          existingAnswers ? 'Update Registration' : 'Register',
          existingAnswers ? 'Inschrijving bijwerken' : 'Inschrijven'
        )}
      </Button>
    </Box>
  );
}
