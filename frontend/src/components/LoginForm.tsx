import { useState, useRef } from 'react';
import { Button } from '@mui/material';
import ValidatedPassword from './ValidatedPassword.tsx';
import { enqueueSnackbar } from 'notistack';
import ValidatedTextField from './ValidatedTextField';
import { emailValidator, noneValidator } from '../validator.ts';
import { text } from '../util.ts';
import { apiFetch } from '../api.ts';

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const formValid = useRef({ email: false, password: false });

  const handleSubmit = async () => {
    if (Object.values(formValid.current).some((isValid) => !isValid)) {
      enqueueSnackbar('Please enter valid email and password.', {
        variant: 'error'
      });
      return;
    }
    const { error } = await apiFetch<void>('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (error) {
      switch (error.message) {
        case 'Unauthorized':
          enqueueSnackbar('Incorrect email or password.', { variant: 'error' });
          break;
        default:
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error'
          });
      }
    } else {
      onClose();
      enqueueSnackbar('You logged in.', { variant: 'success' });
    }
  };

  return (
    <>
      <div className="grid gap-4">
        <h1>{text('Login', 'Inloggen')}</h1>
        <div className="grid gap-2.5">
          <ValidatedTextField
            label={'Email'}
            validator={emailValidator}
            onChange={(isValid) => (formValid.current.email = isValid)}
            setValue={setEmail}
          />
          <ValidatedPassword
            label={text('Password', 'Wachtwoord')}
            validator={noneValidator}
            onChange={(isValid) => (formValid.current.password = isValid)}
            setValue={setPassword}
          />
        </div>
        <Button variant="contained" onClick={handleSubmit}>
          {text('Login', 'Inloggen')}
        </Button>
      </div>
    </>
  );
}
