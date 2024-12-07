import { useState, useRef } from 'react';
import { Backdrop, Button, CircularProgress } from '@mui/material';
import ValidatedPassword from './ValidatedPassword.tsx';
import { enqueueSnackbar } from 'notistack';
import ValidatedTextField from './ValidatedTextField';
import { emailValidator, noneValidator } from './validator.ts';
import { text } from '../util.ts';

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const formValid = useRef({ email: false, password: false });

  const handleSubmit = async () => {
    if (Object.values(formValid.current).some((isValid) => !isValid)) {
      enqueueSnackbar('Please enter valid email and password.', {
        variant: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      switch (response.status) {
        case 200:
          onClose();
          enqueueSnackbar('You logged in.', { variant: 'success' });
          break;
        case 401:
          enqueueSnackbar('Incorrect email or password.', { variant: 'error' });
          break;
        default:
          enqueueSnackbar('Something went wrong. Please try again later.', {
            variant: 'error'
          });
      }
    } catch (error) {
      enqueueSnackbar(String(error), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-2.5">
        <p className="text-2xl mt-2">Login</p>
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
        <Button variant="contained" onClick={handleSubmit}>
          {text('Login', 'Inloggen')}
        </Button>
      </div>
      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  );
}
