import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { text } from '../util.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { AgendaEventType } from '../types.ts';
import { useState } from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment/moment';

interface RegisterButtonProps {
  agendaEvent: AgendaEventType;
}

export default function RegisterButton({ agendaEvent }: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen } = useAuth();
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  moment.locale(langCode);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setRegisterDialogOpen((prevState) => !prevState);
  };

  const now = new Date();
  const registrationOpenTime = new Date(agendaEvent.registrationOpenTime);
  const registrationCloseTime = new Date(agendaEvent.registrationCloseTime);

  return (
    <>
      {agendaEvent.numberOfRegistrations === agendaEvent.maxRegistrations ? (
        <Button variant="contained" disabled>
          {text('Full', 'Vol')}
        </Button>
      ) : registrationOpenTime > now ? (
        <div className="text-right grid">
          <p>{text('Registrations open at ', 'Inschrijvingen openen op ')}</p>
          <p>{moment(agendaEvent.registrationOpenTime).format('DD MMM HH:mm')}</p>
        </div>
      ) : registrationCloseTime > now ? (
        <Button onClick={isLoggedIn ? toggleDialog : toggleAuthOpen} variant="contained">
          {isLoggedIn
            ? text('Register', 'Inschrijven')
            : text('Login to register', 'Login om je in te schrijven')}
        </Button>
      ) : (
        <div className="text-right grid">
          <p>{text('Registrations closed at ', 'Inschrijvingen zijn gesloten sinds ')}</p>
          <p>{moment(agendaEvent.registrationCloseTime).format('DD MMM HH:mm')}</p>
        </div>
      )}
      <Dialog open={registerDialogOpen} onClose={toggleDialog} fullWidth>
        <DialogContent>
          <RegisterForm agendaEvent={agendaEvent} />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
