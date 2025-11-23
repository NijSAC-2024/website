import {Box, Button, FormControl} from '@mui/material';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useUsers} from '../hooks/useUsers.ts';
import {FormInputPassword} from './form/FormInputPassword.tsx';
import {useForm} from 'react-hook-form';
import {FormInputText} from './form/FormInputText.tsx';

type LoginFormForm = {
  email: string;
  password: string;
}

export default function LoginForm({close}: { close: () => void }) {
  const {text} = useLanguage();
  const {login} = useUsers();
  const {register, handleSubmit, control, formState} = useForm<LoginFormForm>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <>
      <Box className="grid gap-4" component="form" onSubmit={handleSubmit(async form => {
        if (await login(form.email, form.password)) {
          close();
        }
      })}>
        <h1>{text('Login', 'Inloggen')}</h1>
        <FormControl>
          <FormInputText
            {...register('email', {
              pattern: {
                value: /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i,
                message: text('Invalid email address', 'Ongeldig e-mailadres')
              }
            })}
            control={control}
            type="email"
            size="medium"
            label={text('Email', 'E-mail')}
            autoComplete="email"
          />
        </FormControl>
        <FormControl>
          <FormInputPassword
            {...register('password', {
              minLength: {
                value: 3, // TODO change to 10 later
                message: text('Password must be at least 10 characters long', 'Wachtwoord moet minimaal 10 karakters lang zijn')
              }
            })}
            control={control}
            label={text('Password', 'Wachtwoord')}

          />
        </FormControl>
        <Button variant="contained" type="submit" loading={formState.isSubmitting}>
          {text('Login', 'Inloggen')}
        </Button>
      </Box>
    </>
  );
}
