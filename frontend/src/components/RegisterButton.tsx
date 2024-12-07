import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { text } from '../util.ts';
import { useAuth } from '../providers/AuthProvider.tsx';
import { AgendaEventType } from '../types.ts';
import { useState } from 'react';

interface RegisterButtonProps {
  agendaEvent: AgendaEventType;
  langCode: string;
}

export default function RegisterButton({ agendaEvent, langCode }: RegisterButtonProps) {
  const { isLoggedIn } = useAuth();
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setRegisterDialogOpen((prevState) => !prevState);
  };

  const now = new Date();
  const registrationOpenTime = new Date(agendaEvent.registrationOpenTime);
  const registrationCloseTime = new Date(agendaEvent.registrationCloseTime);

  console.log(isLoggedIn);

  return (
    <>
      {isLoggedIn ? (
        agendaEvent.numberOfRegistrations === agendaEvent.maxRegistrations ? (
          <Button variant="contained" disabled>
            {text('Full', 'Vol')}
          </Button>
        ) : registrationOpenTime > now ? (
          <p className="text-right">
            {text('Registration opens at', 'Aanmeldingen openen op')}{' '}
            {registrationOpenTime.toLocaleString(langCode)}
          </p>
        ) : registrationCloseTime > now ? (
          <Button onClick={toggleDialog} variant="contained">
            {text('Register', 'Aanmelden')}
          </Button>
        ) : (
          <p className="text-right">
            {text('Registrations closed at', 'Aanmeldingen zijn gesloten sinds')}{' '}
            {registrationCloseTime.toLocaleString(langCode)}
          </p>
        )
      ) : (
        <p>Please log in to register.</p>
      )}
      <Dialog open={registerDialogOpen} onClose={toggleDialog} fullWidth>
        <DialogContent>
          <h1>Registration form</h1>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
