import ContentCard from '../ContentCard.tsx';
import { Box, FormControl } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import {Answer, BasicUser, Question, Registration} from '../../types.ts';
import { useApiState } from '../../providers/ApiProvider.tsx';
import { useState } from 'react';
import AreYouSure from '../AreYouSure.tsx';
import RegistrationTable from './RegistrationTable.tsx';
import RegistrationDialog from './RegistrationDialog.tsx';
import RegisterUserAutocomplete from './RegisterUserAutocomplete.tsx';
import {isAdminOrBoard} from '../../util.ts';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import moment from 'moment';

interface RegistrationsCardProps {
  questions: Question[];
}

export default function RegistrationsCard({ questions }: RegistrationsCardProps) {
  const { registrations, event, updateRegistration, deleteRegistration, createRegistration } = useApiState();
  const { text } = useLanguage();
  const { user } = useAuth();

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedUser, setSelectedUser] = useState<BasicUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleRegisterDialog = () => setRegisterDialogOpen((prev) => !prev);

  const handleEditClick = (registration: Registration) => {
    setSelectedUser(null);
    setSelectedRegistration(registration);
    setRegisterDialogOpen(true);
  };

  const handleRegistration = async (answers: Answer[], registrationId?: string, userId?: string, waitinListPosition?: number) => {
    if (!event) {
      return;
    }
    if (registrationId) {
      await updateRegistration(event?.id, registrationId, answers, undefined, waitinListPosition);
    } else {
      await createRegistration(event?.id, userId, answers);
    }
    setRegisterDialogOpen(false);
    setSelectedRegistration(null);
    setSelectedUser(null);
  };

  const handleDeregisterClick = () => setConfirmOpen(true);

  const handleConfirmDeregister = async () => {
    if (selectedRegistration && event) {
      await deleteRegistration(event?.id, selectedRegistration.registrationId);
    }
    setConfirmOpen(false);
    setRegisterDialogOpen(false);
    setSelectedRegistration(null);
  };

  return (
    <>
      {((!!user && event?.requiredMembershipStatus.includes(user?.status)) || event?.requiredMembershipStatus.includes('nonMember')) && event?.registrationPeriod && (
        <ContentCard className="xl:col-span-3">
          <h1>{text('Registrations', 'Inschrijvingen')}</h1>
          <p>
            <AccessAlarmIcon className=" mr-2" />
            {text('Registrations close at ', 'Inschrijvingen sluiten op ')}
            {moment(event?.registrationPeriod.end).format('DD MMM HH:mm')}
          </p>

          {isAdminOrBoard(user) && (
            <Box className="mt-2 grid" component="form" onSubmit={(e) => { e.preventDefault(); toggleRegisterDialog(); }}>
              <FormControl>
                <RegisterUserAutocomplete
                  registrations={registrations}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  setSelectedRegistration={setSelectedRegistration}
                  toggleRegisterDialog={toggleRegisterDialog}
                />
              </FormControl>
            </Box>
          )}

          {registrations && registrations.length > 0 ? (
            <RegistrationTable
              registrations={registrations.sort((a, b) =>
                `${a.firstName} ${a.infix ?? ''} ${a.lastName}`.localeCompare(
                  `${b.firstName} ${b.infix ?? ''} ${b.lastName}`,
                ),
              )}
              questions={questions}
              eventId={event?.id}
              onEditClick={handleEditClick}
            />
          ) : (
            <p className="mt-2">{text('No registrations yet', 'Nog geen deelnemers')}</p>
          )}
        </ContentCard>
      )}

      {event && (
        <RegistrationDialog
          open={registerDialogOpen}
          toggleDialog={toggleRegisterDialog}
          name={event?.name}
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