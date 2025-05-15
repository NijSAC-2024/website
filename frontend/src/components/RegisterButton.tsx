import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useAuth } from '../providers/AuthProvider.tsx';
import {DateType, Language, MembershipStatus, Question} from '../types.ts';
import { useState } from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment/moment';

interface RegisterButtonProps {
  registrationCount?: number;
  registrationMax?: number;
  registrationPeriod: DateType
  requiredMembershipStatus: MembershipStatus[];
  questions: Question[];
  title: Language;
}

export default function RegisterButton({
  registrationCount,
  registrationMax,
  registrationPeriod,
  requiredMembershipStatus,
  questions,
  title
}: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen, user } = useAuth();
  const { text, language } = useLanguage();
  moment.locale(language);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setRegisterDialogOpen((prevState) => !prevState);
  };

  const now = new Date();
  const openTime = new Date(registrationPeriod.start);
  const closeTime = new Date(registrationPeriod.end);

  return (
    <>
      {registrationCount === registrationMax ? (
        <Button variant="contained" disabled>
          {text('Full', 'Vol')}
        </Button>
      ) : openTime > now ? (
        <div className="text-right grid">
          <p>
            {text('Registrations open at ', 'Inschrijvingen openen op ')}
          </p>
          <p>{moment(registrationPeriod.start).format('DD MMM HH:mm')}</p>
        </div>
      ) : closeTime > now ? (
        <Button
          onClick={isLoggedIn ? toggleDialog : toggleAuthOpen}
          variant="contained"
        >
          {isLoggedIn && requiredMembershipStatus.includes(user!.status) || requiredMembershipStatus.includes('nonMember')
            ? text('Register', 'Inschrijven')
            : text('Login to register', 'Login om in te schrijven')}
        </Button>
      ) : (
        <div className="text-right grid">
          <p>
            {text(
              'Registrations closed at ',
              'Inschrijvingen zijn gesloten sinds '
            )}
          </p>
          <p>{moment(registrationPeriod.end).format('DD MMM HH:mm')}</p>
        </div>
      )}
      <Dialog open={registerDialogOpen} onClose={toggleDialog} fullWidth>
        <DialogContent>
          <RegisterForm
            registrationQuestions={questions}
            title={title}
            registrationCloseTime={registrationPeriod.end}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
