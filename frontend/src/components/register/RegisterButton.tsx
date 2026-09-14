import {Button, Dialog, DialogActions, DialogContent, Tooltip} from '@mui/material';
import {Answer} from '../../types.ts';
import {useState} from 'react';
import RegisterForm from './RegisterForm.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import moment from 'moment/moment';
import AreYouSure from '../AreYouSure.tsx';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import {isAdminOrBoard} from '../../util.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useEventRegistrationHook} from '../../hooks/useEventRegistrationHook.ts';
import {useEventHook} from '../../hooks/useEventHook.ts';
import {useAuth} from '../../providers/AuthProvider.tsx';

interface RegisterButtonProps {
  eventId: string;
}

export default function RegisterButton({
  eventId,
}: RegisterButtonProps) {
  const {useUserEventRegistrations} = useUserHook();
  const {user} = useAuth()
  const {text, language} = useLanguage();
  moment.locale(language);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const {
    updateRegistration,
    createRegistration,
    deleteRegistration
  } = useEventRegistrationHook();
  const userEventRegistrations = useUserEventRegistrations(user?.id)
  const {useEvent} = useEventHook();
  const event = useEvent(eventId);
  if (!event || !event.registrationPeriod) {
    return null;
  }
  const registration = userEventRegistrations?.find((r) => r.eventId === eventId) || undefined;

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleRegisterDialog = () => setRegisterDialogOpen((prevState) => !prevState);

  const handleRegistration = async (answers: Answer[], guestName?: string, guestEmail?: string) => {
    if (registration?.id) {
      await updateRegistration(eventId, registration.id, answers, registration?.waitingListPosition, guestName, guestEmail);
    } else {
      await createRegistration(eventId, answers, user?.id, guestName, guestEmail);
    }
    toggleRegisterDialog();
  };

  const handleRegistrationClick = async () => {
    if (!!user && event.questions.length === 0) {
      if (registration) {
        toggleDialog();
      } else {
        await createRegistration(eventId, [], user?.id);
      }
    } else {
      toggleRegisterDialog();
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    await deleteRegistration(eventId, registrationId);
    toggleDialog();
    setRegisterDialogOpen(false);
  };

  const now = new Date();
  const openTime = new Date(event.registrationPeriod.start);
  const closeTime = new Date(event.registrationPeriod.end);

  const renderClock = () => {
    const now = moment();
    const close = moment(closeTime);
    const diffHours = close.diff(now, 'hours');
    const diffDays = close.diff(now, 'days');

    let message = '';
    let color = 'inherit';

    if (diffHours <= 24) {
      message = `Registrations close in ${diffHours === 1 ? '1 hour' : `${diffHours} hours!`}`;
      color = 'text-red-500';
    } else if (diffDays <= 7) {
      message = `Registrations close in ${diffDays === 1 ? '1 day' : `${diffDays} days!`}`;
    } else {
      return null;
    }

    return (
      <div className="flex justify-center items-center">
        <Tooltip title={message || ''}>
          <p>
            <AccessAlarmIcon className={`ml-2 ${color}`}/>
          </p>
        </Tooltip>
      </div>
    );
  };

  const renderRegistrationStatus = () => {
    const notOpenYet = now < openTime;
    const isOpen = now >= openTime && now <= closeTime;
    const isClosed = now > closeTime;
    const inQueue = registration?.waitingListPosition !== null && registration?.waitingListPosition !== undefined;
    const isFull = event.registrationMax ? event.registrationCount >= event.registrationMax : false;
    const isQueueFull = event.waitingListMax ? event.waitingListCount >= event.waitingListMax : false;
    const canRegister = (
      (user && user.status === 'accepted' && event.requiredMembership.includes(user.membership))
            || event.requiredMembership.includes('nonMember')
    );

    if (registration) {
      return <Button variant="contained" onClick={handleRegistrationClick}
        disabled={!isAdminOrBoard(user?.roles) && isClosed}>{inQueue ? text('In Queue', 'Op de wachtlijst') : text('Registered', 'Ingeschreven')}</Button>;
    }

    if (isOpen || isAdminOrBoard(user?.roles)) {
      if (canRegister) {
        if (isFull) {
          if (isQueueFull) {
            return <Button variant="contained" disabled>{text('Full', 'Vol')}</Button>;
          }
          return <Button variant="contained"
            onClick={handleRegistrationClick}>{text('Join Queue', 'Inschrijven wachtlijst')}{renderClock()}</Button>;
        } else {
          return <Button variant="contained"
            onClick={handleRegistrationClick}>{text('Register', 'Inschrijven')}{renderClock()}</Button>;
        }
      } else {
        if (isFull) {
          if (isQueueFull) {
            return <Button variant="contained" disabled>{text('Full', 'Vol')}</Button>;
          }
          return <Button variant="contained" disabled>{text('Login to join queue', 'Inloggen voor inschrijven wachtlijst')}</Button>;
        }
        return <Button variant="contained" disabled>{text('Login to register', 'Inloggen vereist')}</Button>;
      }
    }

    if (notOpenYet) {
      return (
        <div className="text-right grid">
          <p>{text('Registrations open at ', 'Inschrijvingen openen op ')}</p>
          <p>{moment(event.registrationPeriod?.start).format('DD MMM HH:mm')}</p>
        </div>
      );
    }

    if (isClosed) {
      return (
        <div className="text-right grid">
          <p>
            {text(
              'Registrations closed at ',
              'Inschrijvingen zijn gesloten sinds '
            )}
          </p>
          <p>{moment(event.registrationPeriod?.end).format('DD MMM HH:mm')}</p>
        </div>
      )
    }

    return null;
  };

  return (
    <>
      {renderRegistrationStatus()}
      <Dialog open={registerDialogOpen} onClose={toggleRegisterDialog} fullWidth>
        <DialogContent>
          <div className="grid gap-2">
            <h1>
              {text(
                'Registration for ' + event.name.en,
                'Inschrijving voor ' + event.name.nl
              )}
            </h1>
            <p>
              <AccessAlarmIcon className=" mr-2"/>
              {`${text('Registrations close at ', 'Inschrijvingen sluiten op ')} ${moment(event.registrationPeriod.end).format('DD MMM HH:mm')}.`}
            </p>
            {!registration && event.registrationMax && !!event.registrationCount && event.registrationCount >= event.registrationMax && !isAdminOrBoard(user?.roles) && (
              <b>
                {text('The event is currently full. By registering, you will be put in the waiting queue. If a spot becomes available, you will automatically be registered and notified.',
                  'Het evenement zit momenteel vol. Door je aan te melden kom je op de wachtlijst. Zodra er een plek vrijkomt, word je automatisch ingeschreven en ontvang je bericht.')}
                {` ${text('There are', 'Er staan')} ${event.waitingListCount} ${text('people in the queue.', 'mensen op de wachtlijst')}`}
              </b>
            )}
            {registration && registration?.waitingListPosition !== null && registration?.waitingListPosition !== undefined && (
              <b>
                {`${text('You are at position', 'Je staat op positie')} ${registration?.waitingListPosition + 1} ${text('in the waiting queue.', 'op de wachtlijst.')}`}
              </b>
            )}
            <RegisterForm
              registrationQuestions={event.questions}
              handleRegistration={(answers, guestName, guestEmail) => handleRegistration(answers, guestName, guestEmail)}
              registration={registration}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {registration ? (
            <div className="flex justify-between w-full">
              <Button color="error" variant="outlined"
                onClick={toggleDialog}>{registration.waitingListPosition !== null ? text('Deregister from queue', 'Uitschrijven van wachtlijst') : text('Deregister', 'Uitschrijven')}</Button>
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
        onConfirm={() => handleDeleteRegistration(registration!.id)}
        message={text(
          'You are about to deregister for this event.',
          'Je staat op het punt je uit te schrijven voor dit evenement.'
        )}
      />
    </>
  );
}
