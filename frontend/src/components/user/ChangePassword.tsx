import {FormEvent, useState} from 'react';
import {Box, Button, FormControl, FormHelperText} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {ErrorType, Language} from '../../types.ts';
import {passwordValidator, repeatPasswordValidator} from '../../validator.ts';
import ContentCard from '../ContentCard.tsx';
import PasswordField from '../PasswordField.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';

export default function ChangePassword() {
  const {text} = useLanguage();
  const {user, updateUserPassword} = useUsers();
  const {state: {routerState: {params}}} = useWebsite();

  const [password, setPassword] = useState({password: '', repeatPassword: ''});
  const [passwordErrors, setPasswordErrors] = useState<{ password: ErrorType; repeatPassword: ErrorType }>({
    password: false,
    repeatPassword: false,
  });

  if (!user) {
    return null;
  }

  const canEdit = isAdminOrBoard(user) || params.user_id === user.id;
  if (!canEdit) {
    return null;
  }

  const handlePasswordChange = (field: 'password' | 'repeatPassword', value: string) => {
    setPassword((prev) => ({...prev, [field]: value}));
  };

  const validatePasswordInputs = () => {
    setPasswordErrors({
      password: passwordValidator(password.password),
      repeatPassword: repeatPasswordValidator(password.password, password.repeatPassword),
    });
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || !params.user_id) {
      return;
    }
    if (Object.values(passwordErrors).some((v) => v)) {
      return;
    }
    if (await updateUserPassword(params.user_id, password.password)) {
      setPassword({password: '', repeatPassword: ''});
    }
  };

  return (
    <ContentCard className="grid gap-3 mt-5">
      <h1>{text('Change password', 'Verander wachtwoord')}</h1>
      <Box component="form" onSubmit={handleChangePassword}>
        <div className="grid gap-5 xl:grid-cols-2">
          <FormControl error={!!passwordErrors.password}>
            <PasswordField
              value={password.password}
              onChange={(e) => handlePasswordChange('password', e.target.value)}
              label={text('New password', 'Nieuw wachtwoord')}
            />
            {passwordErrors.password && (
              <FormHelperText>{text(passwordErrors.password as Language)}</FormHelperText>
            )}
          </FormControl>
          <FormControl error={!!passwordErrors.repeatPassword}>
            <PasswordField
              value={password.repeatPassword}
              onChange={(e) => handlePasswordChange('repeatPassword', e.target.value)}
              label={text('Repeat password', 'Herhaal wachtwoord')}
            />
            {passwordErrors.repeatPassword && (
              <FormHelperText>{text(passwordErrors.repeatPassword as Language)}</FormHelperText>
            )}
          </FormControl>
        </div>
        <div className="flex justify-end mt-5">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={validatePasswordInputs}
          >
            {text('Change Password', 'Wachtwoord Wijzigen')}
          </Button>
        </div>
      </Box>
    </ContentCard>
  );
}
