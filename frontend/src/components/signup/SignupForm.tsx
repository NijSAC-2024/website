import { ReactNode, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel } from '@mui/material';
import ValidatedPassword from '../ValidatedPassword.tsx';
import { enqueueSnackbar } from 'notistack';
import ValidatedTextField from '../ValidatedTextField.tsx';
import { emailValidator, nameValidator, passwordValidator } from '../../validator.ts';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { text } from '../../util.ts';
import { apiFetch } from '../../api.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

const steps = ['Personal', 'Education', 'Financial', 'Emergency contact', 'Overview'];

export default function SignupForm() {
  const { language: lang } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const formValid = useRef({
    email: false,
    firstName: false,
    lastName: false,
    password: false
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (Object.values(formValid.current).some((isValid) => !isValid)) {
      enqueueSnackbar('Please fill in all fields correctly.', { variant: 'error' });
      return;
    }

    const { error } = await apiFetch<void>('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, lastName, password })
    });

    if (error) {
      switch (error.message) {
        case 'Conflict':
          enqueueSnackbar('Email is already in use.', { variant: 'error' });
          break;
        default:
          enqueueSnackbar(`${error.message}: ${error.reference}`, { variant: 'error' });
      }
      return;
    }

    enqueueSnackbar(`Created account: ${firstName} ${lastName}`, { variant: 'success' });
    await router.navigate();
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        <Stepper alternativeLabel activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: ReactNode;
            } = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <ValidatedTextField
          label={text(lang, 'First Name', 'Voornaam')}
          validator={nameValidator}
          onChange={(isValid) => (formValid.current.firstName = isValid)}
          setValue={setFirstName}
        />
        <ValidatedTextField
          label={text(lang, 'Last Name', 'Achternaam')}
          validator={nameValidator}
          onChange={(isValid) => (formValid.current.lastName = isValid)}
          setValue={setLastName}
        />
        <ValidatedTextField
          label={text(lang, 'Email', 'E-mail')}
          validator={emailValidator}
          onChange={(isValid) => (formValid.current.email = isValid)}
          setValue={setEmail}
        />
        <ValidatedPassword
          label={text(lang, 'Password', 'Wachtwoord')}
          validator={passwordValidator}
          onChange={(isValid) => (formValid.current.password = isValid)}
          setValue={setPassword}
        />
        <FormControlLabel
          control={<Checkbox />}
          label={text(
            lang,
            'I give permission to the NijSAC to save and process all personal data I enter on the site.',
            'Ik geef toestemming aan de NijSAC om alle persoonlijke informatie die ik invoer op de site op te slaan en te verwerken.'
          )}
        />
        <div className="flex justify-between">
          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit}>
              Signup
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>
    </>
  );
}
