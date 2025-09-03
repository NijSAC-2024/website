import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider.tsx';
import {Answer, DateType, Language, MembershipStatus, Question, Registration} from '../../types.ts';
import {useState} from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import moment from 'moment/moment';
import AreYouSure from '../AreYouSure.tsx';
import {useApiState} from '../../providers/ApiProvider.tsx';

interface RegisterButtonProps {
  registrationCount?: number;
  registrationMax?: number;
  registrationPeriod: DateType
  requiredMembershipStatus: MembershipStatus[];
  questions: Question[];
  title: Language;
  eventId: string;
  isRegistered: boolean;
}

export default function RegisterButton({
  registrationCount,
  registrationMax,
  registrationPeriod,
  requiredMembershipStatus,
  questions,
  title,
  eventId,
  isRegistered
}: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen, user } = useAuth();
  const { deleteRegistration, createRegistration, updateRegistration, getRegistration} = useApiState()
  const { text, language } = useLanguage();
  moment.locale(language);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [registration, setRegistration] = useState<Registration>();

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleRegisterDialog = async () => {
    if (!registerDialogOpen) {
      if (isRegistered) {
        const registration = await getRegistration(eventId);
        setRegistration(registration);
      } else {
        setRegistration(undefined);
      }
      setRegisterDialogOpen(true);
    } else {
      setRegisterDialogOpen(false);
    }
  };

  const now = new Date();
  const openTime = new Date(registrationPeriod.start);
  const closeTime = new Date(registrationPeriod.end);

  const handleRegistration = async (answers: Answer[], update?: boolean) => {
    if (update) {
      await updateRegistration(eventId, answers);
    } else {
      await createRegistration(eventId, answers);
    }
    toggleRegisterDialog();
  };

  const handleRegistrationClick = async () => {
    if (questions.length === 0) {
      if (isRegistered) {
        toggleDialog();
      } else {
        await createRegistration(eventId, []);
      }
    } else {
      toggleRegisterDialog()
    }
  }

  const handleDeleteRegistration = async () => {
    await deleteRegistration(eventId);
    toggleDialog();
    setRegisterDialogOpen(false)
  }

  const canRegister : boolean = isLoggedIn && requiredMembershipStatus.includes(user!.status) || requiredMembershipStatus.includes('nonMember');

  const renderRegistrationStatus = () => {
    if (isRegistered) {
      return closeTime < now ? (
        <Button variant="contained" disabled>
          {text('Registered', 'Ingeschreven')}
        </Button>
      ) : (
        <Button variant="contained" onClick={handleRegistrationClick}>
          {text('Registered', 'Ingeschreven')}
        </Button>
      );
    }

    if (registrationCount === registrationMax) {
      return <Button variant="contained" disabled>{text('Full', 'Vol')}</Button>;
    }

    if (openTime > now) {
      return (
        <div className="text-right grid">
          <p>{text('Registrations open at ', 'Inschrijvingen openen op ')}</p>
          <p>{moment(registrationPeriod.start).format('DD MMM HH:mm')}</p>
        </div>
      );
    }

    if (closeTime > now) {
      return (
        <Button
          onClick={canRegister ? handleRegistrationClick : toggleAuthOpen}
          variant="contained"
        >
          {canRegister
            ? text('Register', 'Inschrijven')
            : text('Login to register', 'Login om in te schrijven')}
        </Button>
      );
    }

    return (
      <div className="text-right grid">
        <p>
          {text(
            'Registrations closed at ',
            'Inschrijvingen zijn gesloten sinds '
          )}
        </p>
        <p>{moment(registrationPeriod.end).format('DD MMM HH:mm')}</p>
      </div>
    );
  };

  return (
    <>
      {renderRegistrationStatus()}
      <Dialog open={registerDialogOpen} onClose={toggleRegisterDialog} fullWidth>
        <DialogContent>
          <RegisterForm
            registrationQuestions={questions}
            title={title}
            registrationCloseTime={registrationPeriod.end}
            handleRegistration={handleRegistration}
            existingAnswers={registration?.answers}
          />
        </DialogContent>
        <DialogActions>

          {registration ? (
            <div className="flex justify-between w-full">
              <Button color="error" variant="outlined" onClick={toggleDialog}>{text('Deregister', 'Uitschrijven')}</Button>
              <Button onClick={toggleRegisterDialog}>{text('Close', 'Sluit')}</Button>
            </div>
          ) : (
            <Button onClick={toggleRegisterDialog}>{text('Close', 'Sluit')}</Button>
          )}

        </DialogActions>
      </Dialog>
      <AreYouSure
        open={dialogOpen}
        onCancel={toggleDialog}
        onConfirm={handleDeleteRegistration}
        message={text(
          'You are about to deregister for this event.',
          'Je staat op het punt je uit te schrijven voor dit evenement.'
        )}
      />
    </>
  );
}
