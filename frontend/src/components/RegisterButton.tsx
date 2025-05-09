import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { text } from '../util.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { Language, Question } from '../types.ts';
import { useState } from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment/moment';

interface RegisterButtonProps {
  registrationCount?: number;
  registrationMax?: number;
  registrationOpenTime: string;
  registrationCloseTime: string;
  questions: Question[];
  title: Language;
}

export default function RegisterButton({
  registrationCount,
  registrationMax,
  registrationOpenTime,
  registrationCloseTime,
  questions,
  title,
}: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen } = useAuth();
  const { language: lang } = useLanguage();
  moment.locale(lang);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setRegisterDialogOpen((prevState) => !prevState);
  };

  const now = new Date();
  const openTime = new Date(registrationOpenTime);
  const closeTime = new Date(registrationCloseTime);

  return (
    <>
      {registrationCount === registrationMax ? (
        <Button variant="contained" disabled>
          {text(lang, 'Full', 'Vol')}
        </Button>
      ) : openTime > now ? (
        <div className="text-right grid">
          <p>
            {text(lang, 'Registrations open at ', 'Inschrijvingen openen op ')}
          </p>
          <p>{moment(registrationOpenTime).format('DD MMM HH:mm')}</p>
        </div>
      ) : closeTime > now ? (
        <Button
          onClick={isLoggedIn ? toggleDialog : toggleAuthOpen}
          variant="contained"
        >
          {isLoggedIn
            ? text(lang, 'Register', 'Inschrijven')
            : text(lang, 'Login to register', 'Login om in te schrijven')}
        </Button>
      ) : (
        <div className="text-right grid">
          <p>
            {text(
              lang,
              'Registrations closed at ',
              'Inschrijvingen zijn gesloten sinds ',
            )}
          </p>
          <p>{moment(registrationCloseTime).format('DD MMM HH:mm')}</p>
        </div>
      )}
      <Dialog open={registerDialogOpen} onClose={toggleDialog} fullWidth>
        <DialogContent>
          <RegisterForm
            registrationQuestions={questions}
            title={title}
            registrationCloseTime={registrationCloseTime}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{text(lang, 'Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
