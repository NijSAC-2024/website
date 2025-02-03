import React from 'react';
import { Box, Button, FormControl, FormLabel, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { text } from '../util.ts';
import { apiFetchVoid } from '../api.ts';

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 5) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 5 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);

    const { error } = await apiFetchVoid('/login', {
      method: 'POST',
      body: JSON.stringify({ email: data.get('email'), password: data.get('password') })
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
        <Box className="grid gap-2.5" component="form" onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              name="email"
              autoComplete="email"
              variant="outlined"
              error={emailError}
              helperText={emailErrorMessage}
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">{text('Password', 'Wachtwoord')}</FormLabel>
            <TextField
              required
              fullWidth
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="new-password"
              variant="outlined"
              error={passwordError}
              helperText={passwordErrorMessage}
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <Button variant="contained" type="submit" onClick={validateInputs}>
            {text('Login', 'Inloggen')}
          </Button>
        </Box>
      </div>
    </>
  );
}
