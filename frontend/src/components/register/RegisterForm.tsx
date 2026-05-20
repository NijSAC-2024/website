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
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import moment from 'moment';
import {FormEvent, useState} from 'react';
import {NON_MEMBER_EMAIL_QUESTION_ID, NON_MEMBER_NAME_QUESTION_ID} from './registration.ts';
import {emailValidator} from '../../validator.ts';

interface RegisterFormProps {
  registrationQuestions: Question[];
  handleRegistration: (answers: Answer[]) => void;
  existingAnswers?: Answer[];
  requireNonMemberName: boolean;
}

export default function RegisterForm({
  registrationQuestions,
  handleRegistration,
  existingAnswers,
  requireNonMemberName,
}: RegisterFormProps) {
  const {text, language} = useLanguage();
  const now = new Date()
  const [answers, setAnswers] = useState<Answer[]>(
    registrationQuestions.map((q) => {
      const existingAnswer = existingAnswers?.find(
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
  const [nonMemberName, setNonMemberName] = useState<string>(() => (
    existingAnswers?.find((answer) => answer.questionId === NON_MEMBER_NAME_QUESTION_ID)?.answer ?? ''
  ));
  const [nonMemberEmail, setNonMemberEmail] = useState<string>(() => (
    existingAnswers?.find((answer) => answer.questionId === NON_MEMBER_EMAIL_QUESTION_ID)?.answer ?? ''
  ));
  const [nonMemberNameError, setNonMemberNameError] = useState<ErrorType>(false);
  const [nonMemberEmailError, setNonMemberEmailError] = useState<ErrorType>(false);
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
    if (requireNonMemberName && nonMemberName.trim() === '') {
      setNonMemberNameError({
        en: 'This field is required',
        nl: 'Dit veld is verplicht'
      });
    } else {
      setNonMemberNameError(false);
    }
    if (requireNonMemberName && nonMemberEmail.trim() === '') {
      setNonMemberEmailError({
        en: 'This field is required',
        nl: 'Dit veld is verplicht'
      });
    } else if (requireNonMemberName) {
      setNonMemberEmailError(emailValidator(nonMemberEmail));
    } else {
      setNonMemberEmailError(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (Object.values(errors).some((v) => v) || !!nonMemberNameError || !!nonMemberEmailError) {
      return;
    }
    const filteredAnswers = answers.filter((answer) => answer.questionId !== NON_MEMBER_NAME_QUESTION_ID && answer.questionId !== NON_MEMBER_EMAIL_QUESTION_ID && answer.answer.trim() !== '');
    const finalAnswers = requireNonMemberName
      ? [...filteredAnswers, {questionId: NON_MEMBER_NAME_QUESTION_ID, answer: nonMemberName.trim()}, {questionId: NON_MEMBER_EMAIL_QUESTION_ID, answer: nonMemberEmail.trim()}]
      : filteredAnswers;
    handleRegistration(finalAnswers);
  }

  return (
    <Box className="grid gap-3" component="form" onSubmit={handleSubmit}>
      {requireNonMemberName && (
        <>
          <FormControl fullWidth>
            <TextField
              label={`${text('Name', 'Naam')} *`}
              value={nonMemberName}
              onChange={(event) => {
                setNonMemberName(event.target.value);
              }}
              error={!!nonMemberNameError}
              helperText={nonMemberNameError && text(nonMemberNameError as Language)}
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              label={`${text('Email', 'Email')} *`}
              value={nonMemberEmail}
              onChange={(event) => {
                setNonMemberEmail(event.target.value);
              }}
              error={!!nonMemberEmailError}
              helperText={nonMemberEmailError && text(nonMemberEmailError as Language)}
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
          existingAnswers ? 'Update Registration' : 'Register',
          existingAnswers ? 'Inschrijving bijwerken' : 'Inschrijven'
        )}
      </Button>
    </Box>
  );
}
