import {FormEvent, useState} from 'react';
import {Box, Button, FormControl, FormHelperText, TextField} from '@mui/material';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import PasswordField from './PasswordField.tsx';
import {emailValidator, passwordValidator} from '../validator.ts';
import {Language, User} from '../types.ts';
import {enqueueSnackbar} from 'notistack';
import {apiFetch,} from '../api.ts';
import {useWebsite} from '../hooks/useState.ts';


export default function LoginForm({close}: { close: () => void }) {
  const {text} = useLanguage();
  const {dispatch} = useWebsite();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<Language | boolean>(false);
  const [passwordError, setPasswordError] = useState<Language | boolean>(false);

  const validateInputs = () => {
    setEmailError(emailValidator(email));
    setPasswordError(passwordValidator(password));
  };

  const login = (email: string, password: string) => {
    apiFetch<User>('/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    }).then(({data: user, error}) => {
      if (error) {
        switch (error.message) {
        case 'Unauthorized':
          enqueueSnackbar('Incorrect email or password.', {variant: 'error'});
          break;
        default:
          enqueueSnackbar(`${error.message}: ${error.reference}`, {variant: 'error'});
        }
      } else {
        dispatch({type: 'set_user', user});
        enqueueSnackbar('You logged in', {variant: 'success'});
        close();
      }
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return;
    }
    login(email, password);
  };


  return (
    <>
      <Box className="grid gap-4" component="form" onSubmit={handleSubmit}>
        <h1>{text('Login', 'Inloggen')}</h1>
        <FormControl>
          <TextField
            label={text('Email', 'E-mail')}
            autoComplete="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError && text(emailError as Language)}
          />
        </FormControl>
        <FormControl error={!!passwordError}>
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label={text('Password', 'Wachtwoord')}
          />
          {passwordError && <FormHelperText>{text(passwordError as Language)}</FormHelperText>}
        </FormControl>
        <Button variant="contained" type="submit" onClick={validateInputs}>
          {text('Login', 'Inloggen')}
        </Button>
      </Box>
    </>
  );
}
