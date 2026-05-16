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
  const registration = userEventRegistrations?.find((r) => r.eventId === eventId) || null;

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleRegisterDialog = () => setRegisterDialogOpen((prevState) => !prevState);

  const now = new Date();
  const openTime = new Date(event.registrationPeriod.start);
  const closeTime = new Date(event.registrationPeriod.end);

  const handleRegistration = async (answers: Answer[], registrationId: string | null) => {
    if (registrationId) {
      await updateRegistration(eventId, registrationId, answers);
    } else {
      await createRegistration(eventId, user?.id || null, answers);
    }
    toggleRegisterDialog();
  };

  const handleRegistrationClick = async () => {
    if (event.questions.length === 0) {
      if (registration) {
        toggleDialog();
      } else {
        await createRegistration(eventId, user?.id || null, []);
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

  const canRegister = (
    (user && user.status === 'accepted' && event.requiredMembership.includes(user.membership))
        || event.requiredMembership.includes('nonMember')
  );

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
    if (registration) {
      if (closeTime < now && user && !isAdminOrBoard(user.roles)) {
        if (registration?.waitingListPosition !== undefined) {
          return <Button variant="contained" disabled>{text('In Queue', 'Op de wachtlijst')}</Button>;
        } else {
          return <Button variant="contained" disabled>{text('Registered', 'Ingeschreven')}</Button>;
        }
      } else {
        if (registration?.waitingListPosition !== undefined) {
          return <Button variant="contained"
            onClick={handleRegistrationClick}>{text('In Queue', 'Op de wachtlijst')}</Button>;
        } else {
          return <Button variant="contained"
            onClick={handleRegistrationClick}>{text('Registered', 'Ingeschreven')}</Button>;
        }
      }
    }

    if (event.registrationCount && event.registrationMax && event.registrationCount >= event.registrationMax && (user && !isAdminOrBoard(user.roles))) {
      if (event.waitingListCount !== undefined && event.waitingListMax !== undefined && event.waitingListCount >= event.waitingListMax) {
        return <Button variant="contained" disabled>{text('Full', 'Vol')}</Button>;
      }
      if (canRegister) {
        return <Button variant="contained"
          onClick={handleRegistrationClick}>{text('Join Queue', 'Inschrijven wachtlijst')}{renderClock()}</Button>;
      }
    }

    if (openTime > now) {
      return (
        <div className="text-right grid">
          <p>{text('Registrations open at ', 'Inschrijvingen openen op ')}</p>
          <p>{moment(event.registrationPeriod?.start).format('DD MMM HH:mm')}</p>
        </div>
      );
    }

    if (closeTime > now) {
      if (canRegister) {
        if (event.registrationCount && event.registrationMax && event.registrationCount >= event.registrationMax && (user && !isAdminOrBoard(user.roles))) {
          return <Button variant="contained"
            onClick={handleRegistrationClick}>{text('Join Queue', 'Inschrijven wachtlijst')}{renderClock()}</Button>;
        }
        return <Button variant="contained"
          onClick={handleRegistrationClick}>{text('Register', 'Inschrijven')}{renderClock()}</Button>;
      }
      if (user && (!event.requiredMembership.includes(user.membership) || user.status !== 'accepted')) {
        return <Button variant="contained" disabled>{text('Register', 'Inschrijven')}{renderClock()}</Button>;
      }
      //TODO: Open login dialog
      return <Button variant="contained">{text('Login to register', 'Login om in te schrijven')}</Button>;
    } else if (user && isAdminOrBoard(user.roles)) {
      return <Button variant="contained"
        onClick={handleRegistrationClick}>{text('Register', 'Inschrijven')}</Button>;
    }

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
                'Registration for ' + event.name.en,
                'Inschrijving voor ' + event.name.nl
              )}
            </h1>
            <p>
              <AccessAlarmIcon className=" mr-2"/>
              {text('Registrations close at ', 'Inschrijvingen sluiten op ')}
              {moment(event.registrationPeriod.end).format('DD MMM HH:mm')}
            </p>
            {!registration && event.registrationMax && !!event.registrationCount && event.registrationCount >= event.registrationMax && (user && !isAdminOrBoard(user.roles)) && (
              <b>
                {text('The event is currently full. By registering, you will be put in the waiting queue. If a spot becomes available, you will automatically be registered and notified.',
                  'Het evenement zit momenteel vol. Door je aan te melden kom je op de wachtlijst. Zodra er een plek vrijkomt, word je automatisch ingeschreven en ontvang je bericht.')}
                {` ${text('There are', 'Er staan')} ${event.waitingListCount} ${text('people in the queue.', 'mensen op de wachtlijst')}`}
              </b>
            )}
            {registration && registration?.waitingListPosition != undefined && (
              <b>
                {`${text('You are at position', 'Je staat op positie')} ${registration?.waitingListPosition + 1} ${text('in the waiting queue.', 'op de wachtlijst.')}`}
              </b>
            )}
            <RegisterForm
              registrationQuestions={event.questions}
              handleRegistration={(answers) => handleRegistration(answers, registration?.registrationId || null)}
              existingAnswers={registration?.answers}
              requireNonMemberName={!user}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {registration ? (
            <div className="flex justify-between w-full">
              <Button color="error" variant="outlined"
                onClick={toggleDialog}>{registration.waitingListPosition != undefined ? text('Deregister from queue', 'Uitschrijven van wachtlijst') : text('Deregister', 'Uitschrijven')}</Button>
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
