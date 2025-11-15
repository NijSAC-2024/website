import ContentCard from '../ContentCard.tsx';
import { Box, FormControl } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {Answer, BasicUser, Question, Registration} from '../../types.ts';
import { useState } from 'react';
import AreYouSure from '../AreYouSure.tsx';
import RegistrationTable from './RegistrationTable.tsx';
import RegistrationDialog from './RegistrationDialog.tsx';
import RegisterUserAutocomplete from './RegisterUserAutocomplete.tsx';
import {isAdminOrBoard} from '../../util.ts';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import moment from 'moment';
import {useUsers} from '../../hooks/useUsers.ts';
import {useEvents} from '../../hooks/useEvents.ts';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';

interface RegistrationsCardProps {
  questions: Question[];
}

export default function RegistrationsCard({ questions }: RegistrationsCardProps) {
  const { text } = useLanguage();
  const {currentEvent} = useEvents();
  const {updateRegistration, createRegistration, deleteRegistration} = useEventRegistrations();
  const {eventRegistrations} = useEventRegistrations();
  const { user } = useUsers();

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedUser, setSelectedUser] = useState<BasicUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!currentEvent) {
    return null
  }

  const toggleRegisterDialog = () => setRegisterDialogOpen((prev) => !prev);

  const handleEditClick = (registration: Registration) => {
    setSelectedUser(null);
    setSelectedRegistration(registration);
    setRegisterDialogOpen(true);
  };

  const handleRegistration = async (answers: Answer[], registrationId?: string, userId?: string, waitingListPosition?: number) => {
    if (registrationId) {
      await updateRegistration(currentEvent.id, registrationId, answers, undefined, waitingListPosition);
    } else {
      await createRegistration(currentEvent.id, userId || null, answers);
    }
    setRegisterDialogOpen(false);
    setSelectedRegistration(null);
    setSelectedUser(null);
  };

  const handleDeregisterClick = () => setConfirmOpen(true);

  const handleConfirmDeregister = async () => {
    if (selectedRegistration) {
      await deleteRegistration(currentEvent.id, selectedRegistration.registrationId);
    }
    setConfirmOpen(false);
    setRegisterDialogOpen(false);
    setSelectedRegistration(null);
  };

  return (
    <>
      {eventRegistrations && currentEvent.registrationPeriod && (
        <ContentCard className="xl:col-span-3">
          <h1>{text('Registrations', 'Inschrijvingen')}</h1>
          <p>
            <AccessAlarmIcon className=" mr-2" />
            {text('Registrations close at ', 'Inschrijvingen sluiten op ')}
            {moment(currentEvent.registrationPeriod.end).format('DD MMM HH:mm')}
          </p>

          {user && isAdminOrBoard(user) && (
            <Box className="mt-2 grid" component="form" onSubmit={(e) => { e.preventDefault(); toggleRegisterDialog(); }}>
              <FormControl>
                <RegisterUserAutocomplete
                  registrations={eventRegistrations}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  setSelectedRegistration={setSelectedRegistration}
                  toggleRegisterDialog={toggleRegisterDialog}
                />
              </FormControl>
            </Box>
          )}

          {eventRegistrations && eventRegistrations.length > 0 ? (
            <RegistrationTable
              onEditClick={handleEditClick}
            />
          ) : (
            <p className="mt-2">{text('No registrations yet', 'Nog geen deelnemers')}</p>
          )}
        </ContentCard>
      )}

      {currentEvent && (
        <RegistrationDialog
          open={registerDialogOpen}
          toggleDialog={toggleRegisterDialog}
          name={currentEvent.name}
          questions={questions}
          selectedRegistration={selectedRegistration}
          selectedUser={selectedUser}
          handleRegistration={handleRegistration}
          handleDeregisterClick={handleDeregisterClick}
        />
      )}

      <AreYouSure
        open={confirmOpen}
        title={text('Deregister', 'Uitschrijven')}
        message={text(
          'Are you sure you want to deregister this user?',
          'Weet je zeker dat je deze gebruiker wilt uitschrijven?'
        )}
        onConfirm={handleConfirmDeregister}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}