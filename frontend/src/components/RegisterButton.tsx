import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { text } from '../util.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { LanguageType, QuestionType } from '../types.ts';
import { useState } from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment/moment';

interface RegisterButtonProps {
  numberOfRegistrations?: number;
  maxRegistrations?: number;
  registrationOpenTime: string;
  registrationCloseTime: string;
  registrationQuestions: QuestionType[];
  title: LanguageType;
}

export default function RegisterButton({
  numberOfRegistrations,
  maxRegistrations,
  registrationOpenTime,
  registrationCloseTime,
  registrationQuestions,
  title
}: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen } = useAuth();
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  moment.locale(langCode);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setRegisterDialogOpen((prevState) => !prevState);
  };

  const now = new Date();
  const openTime = new Date(registrationOpenTime);
  const closeTime = new Date(registrationCloseTime);

  return (
    <>
      {numberOfRegistrations === maxRegistrations ? (
        <Button variant="contained" disabled>
          {text('Full', 'Vol')}
        </Button>
      ) : openTime > now ? (
        <div className="text-right grid">
          <p>{text('Registrations open at ', 'Inschrijvingen openen op ')}</p>
          <p>{moment(registrationOpenTime).format('DD MMM HH:mm')}</p>
        </div>
      ) : closeTime > now ? (
        <Button onClick={isLoggedIn ? toggleDialog : toggleAuthOpen} variant="contained">
          {isLoggedIn
            ? text('Register', 'Inschrijven')
            : text('Login to register', 'Login om in te schrijven')}
        </Button>
      ) : (
        <div className="text-right grid">
          <p>{text('Registrations closed at ', 'Inschrijvingen zijn gesloten sinds ')}</p>
          <p>{moment(registrationCloseTime).format('DD MMM HH:mm')}</p>
        </div>
      )}
      <Dialog open={registerDialogOpen} onClose={toggleDialog} fullWidth>
        <DialogContent>
          <RegisterForm
            registrationQuestions={registrationQuestions}
            title={title}
            registrationCloseTime={registrationCloseTime}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
