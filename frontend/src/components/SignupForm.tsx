import { ReactNode, useRef, useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import ValidatedPassword from './ValidatedPassword.tsx';
import { FormsProps } from '../types';
import { enqueueSnackbar } from 'notistack';
import ValidatedTextField from './ValidatedTextField';
import { emailValidator, nameValidator, passwordValidator } from './validator.ts';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = ['Personal', 'Education', 'Financial', 'Emergency contact', 'Overview'];

export default function SignupForm({ onClose, setLoading }: FormsProps) {
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

    try {
      setLoading(true);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, password })
      });

      switch (response.status) {
        case 201: {
          await response.json();
          onClose();
          enqueueSnackbar(`Created account: ${firstName} ${lastName}`, { variant: 'success' });
          break;
        }
        case 409:
          enqueueSnackbar('Email is already in use.', { variant: 'error' });
          break;
        default:
          enqueueSnackbar('Something went wrong. Please try again later.', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(String(error), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 grid-flow-row gap-2">
        <div className="flex justify-between">
          <p className="text-2xl">Sign Up</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
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
          label={'First Name'}
          validator={nameValidator}
          onChange={(isValid) => (formValid.current.firstName = isValid)}
          setValue={setFirstName}
        />
        <ValidatedTextField
          label={'Last Name'}
          validator={nameValidator}
          onChange={(isValid) => (formValid.current.lastName = isValid)}
          setValue={setLastName}
        />
        <ValidatedTextField
          label={'Email'}
          validator={emailValidator}
          onChange={(isValid) => (formValid.current.email = isValid)}
          setValue={setEmail}
        />
        <ValidatedPassword
          label={'Password'}
          validator={passwordValidator}
          onChange={(isValid) => (formValid.current.password = isValid)}
          setValue={setPassword}
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
