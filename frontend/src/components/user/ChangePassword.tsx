import {Box, Button, FormControl} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import ContentCard from '../ContentCard.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useForm} from 'react-hook-form';
import {FormInputPassword} from '../form/FormInputPassword.tsx';

type ChangePasswordForm = {
  password: string;
  repeatPassword: string;
}

export default function ChangePassword() {
  const {text} = useLanguage();
  const {user, updateUserPassword} = useUsers();
  const {state: {routerState: {params}}} = useWebsite();

  const {register, control, formState, getValues, handleSubmit, reset} = useForm<ChangePasswordForm>({
    defaultValues: {
      password: '',
      repeatPassword: ''
    }
  });

  if (!user) {
    return null;
  }

  if (!isAdminOrBoard(user) && params.user_id !== user.id) {
    return null;
  }

  return (
    <ContentCard className="grid gap-3 mt-5">
      <h1>{text('Change password', 'Verander wachtwoord')}</h1>
      <Box component="form" onSubmit={handleSubmit(async ({password}) => {
        if (await updateUserPassword(params.user_id, password)) {
          reset();
        }
      })}>
        <div className="grid gap-5 xl:grid-cols-2">
          <FormControl>
            <FormInputPassword
              {...register('password', {
                minLength: {
                  value: 10,
                  message: text('Password must be at least 10 characters long', 'Wachtwoord moet minimaal 10 karakters lang zijn')
                }
              })}
              control={control}
              label={text('New password', 'Nieuw wachtwoord')}
            />
          </FormControl>
          <FormControl>
            <FormInputPassword
              {...register('repeatPassword', {
                minLength: {
                  value: 10,
                  message: text('Password must be at least 10 characters long', 'Wachtwoord moet minimaal 10 karakters lang zijn')
                },
                validate: (value) => value === getValues().password || text('Password should match', 'Wachtwoord moet overeenkomen'),
              })}
              control={control}
              label={text('Repeat password', 'Herhaal wachtwoord')}
            />
          </FormControl>
        </div>
        <div className="flex justify-end mt-5">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            loading={formState.isSubmitting}
          >
            {text('Change Password', 'Wachtwoord Wijzigen')}
          </Button>
        </div>
      </Box>
    </ContentCard>
  );
}
