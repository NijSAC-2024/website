import {Button, Dialog, DialogActions, DialogContent, Tooltip} from '@mui/material';
import {Answer} from '../../types.ts';
import {useState} from 'react';
import RegisterForm from './RegisterForm.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import moment from 'moment/moment';
import AreYouSure from '../AreYouSure.tsx';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import {isAdminOrBoard} from '../../util.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';
import {useEvents} from '../../hooks/useEvents.ts';

interface RegisterButtonProps {
  eventId: string;
}

export default function RegisterButton({
  eventId,
}: RegisterButtonProps) {
  const {user} = useUsers();
  const {text, language} = useLanguage();
  moment.locale(language);
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const {userEventRegistrations, updateRegistration, createRegistration, deleteRegistration} = useEventRegistrations();
  const {events} = useEvents();
  const event = events.find(e => e.id === eventId);
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

  const canRegister: boolean = user && event.requiredMembershipStatus.includes(user.status) || event.requiredMembershipStatus.includes('nonMember');

  const renderClock = () => {
    const now = moment();
    const close = moment(closeTime);
    const diffHours = close.diff(now, 'hours');
    const diffDays = close.diff(now, 'days');

    let message = '';
    let color = 'inherit';

    if (diffHours <= 24) {
      message = `Registration closes in ${diffHours === 1 ? '1 hour' : `${diffHours} hours!`}`;
      color = 'text-red-500';
    } else if (diffDays <= 7) {
      message = `Registration closes in ${diffDays === 1 ? '1 day' : `${diffDays} days!`}`;
    }

    return (
      <Tooltip title={message || ''}>
        <p>
          <AccessAlarmIcon className={`mr-2 ${color}`}/>
        </p>
      </Tooltip>
    );
  };

  const renderRegistrationStatus = () => {
    if (registration) {
      if (closeTime < now && user && !isAdminOrBoard(user)) {
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

    if (event.registrationCount && event.registrationMax && event.registrationCount >= event.registrationMax && (user && !isAdminOrBoard(user))) {
      if (event.waitingListCount !== undefined && event.waitingListMax !== undefined && event.waitingListCount >= event.waitingListMax) {
        return <Button variant="contained" disabled>{text('Full', 'Vol')}</Button>;
      }
      if (canRegister) {
        return <Button variant="contained"
          onClick={handleRegistrationClick}>{renderClock()}{text('Join Queue', 'Inschrijven wachtlijst')}</Button>;
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
        if (event.registrationCount && event.registrationMax && event.registrationCount >= event.registrationMax && (user && !isAdminOrBoard(user))) {
          return <Button variant="contained"
            onClick={handleRegistrationClick}>{renderClock()}{text('Join Queue', 'Inschrijven wachtlijst')}</Button>;
        }
        return <Button variant="contained"
          onClick={handleRegistrationClick}>{renderClock()}{text('Register', 'Inschrijven')}</Button>;
      }
      if (user && !event.requiredMembershipStatus.includes(user.status)) {
        return <Button variant="contained" disabled>{renderClock()}{text('Register', 'Inschrijven')}</Button>;
      }
      return <Button variant="contained"
        onClick={toggleAuthOpen}>{text('Login to register', 'Login om in te schrijven')}</Button>;
    } else if (user && isAdminOrBoard(user)) {
      return <Button variant="contained" onClick={handleRegistrationClick}>{text('Register', 'Inschrijven')}</Button>;
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
            {!registration && event.registrationMax && !!event.registrationCount && event.registrationCount >= event.registrationMax && (user && !isAdminOrBoard(user)) && (
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
