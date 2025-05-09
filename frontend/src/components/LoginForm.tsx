import React from 'react';
import { Box, Button, FormControl, FormLabel, TextField } from '@mui/material';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const { login } = useAuth();
  const { text } = useLanguage();

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      console.log('email error');
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 5 characters long.');
      console.log('password error');
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    console.log('checked', email, password, passwordError, emailError);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError) {
      console.log('returned');
      return;
    }
    const data = new FormData(event.currentTarget);
    login(
      data.get('email')?.toString() || '',
      data.get('password')?.toString() || '',
      onClose
    );
  };

  return (
    <>
      <Box className="grid gap-2.5" component="form" onSubmit={handleSubmit}>
        <h1>{text('Login', 'Inloggen')}</h1>
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
          <FormLabel htmlFor="password">
            {text('Password', 'Wachtwoord')}
          </FormLabel>
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
    </>
  );
}
