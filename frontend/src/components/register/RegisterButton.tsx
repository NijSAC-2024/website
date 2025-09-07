import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider.tsx';
import {Answer, DateType, Language, MembershipStatus, Question, Registration} from '../../types.ts';
import {useState} from 'react';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import moment from 'moment/moment';
import AreYouSure from '../AreYouSure.tsx';
import {useApiState} from '../../providers/ApiProvider.tsx';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

interface RegisterButtonProps {
  registrationCount?: number;
  registrationMax?: number;
  waitingListCount?: number;
  waitingListMax?: number;
  registrationPeriod: DateType
  requiredMembershipStatus: MembershipStatus[];
  questions: Question[];
  title: Language;
  eventId: string;
  registration?: Registration;
}

export default function RegisterButton({
  registrationCount,
  registrationMax,
  waitingListCount,
  waitingListMax,
  registrationPeriod,
  requiredMembershipStatus,
  questions,
  title,
  eventId,
  registration
}: RegisterButtonProps) {
  const { isLoggedIn, toggleAuthOpen, user } = useAuth();
  const { deleteRegistration, createRegistration, updateRegistration} = useApiState()
  const { text, language } = useLanguage();
  moment.locale(language);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleRegisterDialog = async () => setRegisterDialogOpen((prevState) => !prevState);

  const now = new Date();
  const openTime = new Date(registrationPeriod.start);
  const closeTime = new Date(registrationPeriod.end);

  const handleRegistration = async (answers: Answer[], registrationId: string | null) => {
    if (registrationId) {
      await updateRegistration(eventId, registrationId, answers);
    } else {
      await createRegistration(eventId, answers);
    }
    await toggleRegisterDialog();
  };

  const handleRegistrationClick = async () => {
    if (questions.length === 0) {
      if (registration) {
        toggleDialog();
      } else {
        await createRegistration(eventId, []);
      }
    } else {
      await toggleRegisterDialog()
    }
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    await deleteRegistration(eventId, registrationId);
    toggleDialog();
    setRegisterDialogOpen(false)
  }

  const canRegister : boolean = isLoggedIn && requiredMembershipStatus.includes(user!.status) || requiredMembershipStatus.includes('nonMember');

  const renderRegistrationStatus = () => {
    if (registration) {
      if (closeTime < now) {
        if (registration?.waitingListPosition !== undefined) {
          return <Button variant="contained" disabled>{text('In Queue', 'Op de wachtlijst')}</Button>;
        } else {
          return <Button variant="contained" disabled>{text('Registered', 'Ingeschreven')}</Button>;
        }
      } else {
        if (registration?.waitingListPosition !== undefined) {
          return <Button variant="contained" onClick={handleRegistrationClick}>{text('In Queue', 'Op de wachtlijst')}</Button>
        } else {
          return <Button variant="contained" onClick={handleRegistrationClick}>{text('Registered', 'Ingeschreven')}</Button>
        }
      }
    }

    if (registrationCount && registrationMax && registrationCount >= registrationMax && !user?.roles.includes('admin')) {
      if (waitingListCount && waitingListMax && waitingListCount >= waitingListMax) {
        return <Button variant="contained" disabled>{text('Full', 'Vol')}</Button>;
      }
      if (canRegister) {
        return <Button variant="contained" onClick={handleRegistrationClick}>{text('Join Queue', 'Inschrijven wachtlijst')}</Button>;
      }
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
      if (canRegister) {
        if (registrationCount && registrationMax && registrationCount >= registrationMax && !user?.roles.includes('admin')) {
          return <Button variant="contained" onClick={handleRegistrationClick}>{text('Join Queue', 'Inschrijven wachtlijst')}</Button>;
        }
        return <Button variant="contained" onClick={handleRegistrationClick}>{text('Register', 'Inschrijven')}</Button>
      }
      if (isLoggedIn && !requiredMembershipStatus.includes(user!.status)) {
        return <Button variant="contained" disabled>{text('Register', 'Inschrijven')}</Button>
      }
      return <Button variant="contained" onClick={toggleAuthOpen}>{text('Login to register', 'Login om in te schrijven')}</Button>
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
          <div className="grid gap-2">
            <h1>
              {text(
                'Registration for ' + title.en,
                'Inschrijving voor ' + title.nl
              )}
            </h1>
            <p>
              <AccessAlarmIcon className=" mr-2" />
              {text('Registrations close at ', 'Inschrijvingen sluiten op ')}
              {moment(registrationPeriod.end).format('DD MMM HH:mm')}
            </p>
            {!registration && registrationMax && !!registrationCount && registrationCount >= registrationMax && !user?.roles.includes('admin') && (
              <b>
                {text('The event is currently full. By registering, you will be put in the waiting queue. If a spot becomes available, you will automatically be registered and notified.',
                  'Het evenement zit momenteel vol. Door je aan te melden kom je op de wachtlijst. Zodra er een plek vrijkomt, word je automatisch ingeschreven en ontvang je bericht.')}
                {` ${text('There are', 'Er staan')} ${waitingListCount} ${text('people in the queue.', 'mensen op de wachtlijst')}`}
              </b>
            )}
            {registration && registration?.waitingListPosition != undefined && (
              <b>
                {`${text('You are at position', 'Je staat op positie')} ${registration?.waitingListPosition} ${text('in de waiting queue.', 'op de wachtlijst.')}`}
              </b>
            )}
            <RegisterForm
              registrationQuestions={questions}
              handleRegistration={(answers) => handleRegistration(answers, registration?.registrationId || null)}
              existingAnswers={registration?.answers}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {registration ? (
            <div className="flex justify-between w-full">
              <Button color="error" variant="outlined" onClick={toggleDialog}>{registration.waitingListPosition != undefined ? text('Deregister from queue', 'Uitschrijven van wachtlijst') : text('Deregister', 'Uitschrijven')}</Button>
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
        onConfirm={() => handleDeleteRegistration(registration!.registrationId)}
        message={text(
          'You are about to deregister for this event.',
          'Je staat op het punt je uit te schrijven voor dit evenement.'
        )}
      />
    </>
  );
}
