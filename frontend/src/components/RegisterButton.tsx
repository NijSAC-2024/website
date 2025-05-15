import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useAuth } from '../providers/AuthProvider.tsx';
import {Answer, DateType, Language, MembershipStatus, Question, Registration} from '../types.ts';
import {useEffect, useState} from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import moment from 'moment/moment';
import {apiFetch} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import AreYouSure from './AreYouSure.tsx';
import {useApiState} from '../providers/ApiProvider.tsx';

interface RegisterButtonProps {
  registrationCount?: number;
  registrationMax?: number;
  registrationPeriod: DateType
  requiredMembershipStatus: MembershipStatus[];
  questions: Question[];
  title: Language;
  id: string;
}

export default function RegisterButton({
  registrationCount,
  registrationMax,
  registrationPeriod,
  requiredMembershipStatus,
  questions,
  title,
  id
}: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen, user } = useAuth();
  const { deleteRegistration, createRegistration, updateRegistration} = useApiState()
  const { text, language } = useLanguage();
  moment.locale(language);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [registration, setRegistration] = useState<Registration>();
  const [refreshKey, setRefreshKey] = useState(0);


  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleRegisterDialog = () => {
    setRegisterDialogOpen((prevState) => !prevState);
  };

  const now = new Date();
  const openTime = new Date(registrationPeriod.start);
  const closeTime = new Date(registrationPeriod.end);

  useEffect(() => {
    if (isLoggedIn) {
      apiFetch<Array<Registration>>(`/event/${id}/registration`).then(({ error, data: registrations }) => {
        if (error) {
          enqueueSnackbar(`${error.message}: ${error.reference}`, {
            variant: 'error',
          });
        }
        if (registrations) {
          setRegistration(registrations.find(reg => reg.userId === user?.id));
        }
      });
    } else {
      setRegistration(undefined);
    }
  }, [id, user?.id, refreshKey, isLoggedIn]);

  const handleRegistration = async (answers: Answer[], update?: boolean) => {
    if (update) {
      await updateRegistration(id, answers);
    } else {
      await createRegistration(id, answers);
    }
    toggleRegisterDialog();
    setRefreshKey(prev => prev + 1);
  };

  const handleRegistrationClick = async () => {
    if (questions.length === 0) {
      if (registration) {
        toggleDialog();
      } else {
        await createRegistration(id, []);
        setRefreshKey(prev => prev + 1);
      }
    } else {
      toggleRegisterDialog()
    }
  }

  const handleDeleteRegistration = async () => {
    await deleteRegistration(id);
    setRefreshKey(prevState => prevState + 1);
    toggleDialog();
    setRegisterDialogOpen(false)
  }

  const canRegister : boolean = isLoggedIn && requiredMembershipStatus.includes(user!.status) || requiredMembershipStatus.includes('nonMember');

  const renderRegistrationStatus = () => {
    if (registration) {
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
          <div className="flex justify-between w-full">
            {registration && (
              <Button color="error" onClick={toggleDialog}>{text('Deregister', 'Uitschrijven')}</Button>
            )}
            <Button onClick={toggleRegisterDialog}>{text('Close', 'Sluit')}</Button>
          </div>
        </DialogActions>
      </Dialog>
      <AreYouSure
        open={dialogOpen}
        onCancel={toggleDialog}
        onConfirm={handleDeleteRegistration}
        message={text(
          'You are about to delete this registration.',
          'Je staat op het punt deze inschrijving te verwijderen.'
        )}
      />
    </>
  );
}
