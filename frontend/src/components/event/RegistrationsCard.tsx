import ContentCard from '../ContentCard.tsx';
import {Box, FormControl, IconButton, Tooltip} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {Answer, BasicUser, Registration} from '../../types.ts';
import {useState} from 'react';
import AreYouSure from '../AreYouSure.tsx';
import RegistrationTable from '../register/RegistrationTable.tsx';
import RegistrationDialog from '../register/RegistrationDialog.tsx';
import RegisterUserAutocomplete from '../register/RegisterUserAutocomplete.tsx';
import {inCommittee, isAdminOrBoard, isChair, isWorga} from '../../util.ts';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import moment from 'moment';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useEventHook} from '../../hooks/useEventHook.ts';
import {useEventRegistrationHook} from '../../hooks/useEventRegistrationHook.ts';
import {useParams} from 'react-router-dom';
import {useAuth} from '../../providers/AuthProvider.tsx';
import LoadingComponent from '../loading/LoadingComponent.tsx';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

export default function RegistrationsCard() {
  const {text} = useLanguage();
  const {useUserCommittees} = useUserHook();
  const {user} = useAuth()
  const myCommittees = useUserCommittees(user?.id);
  const {
    useEventRegistrations,
    updateRegistration,
    deleteRegistration,
    createRegistration
  } = useEventRegistrationHook();
  const {eventId} = useParams();
  const eventRegistrations = useEventRegistrations(eventId)
  const {useEvent} = useEventHook();
  const currentEvent = useEvent(eventId);

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedUser, setSelectedUser] = useState<BasicUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentEvent) {
    return <LoadingComponent/>
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
      await deleteRegistration(currentEvent.id, selectedRegistration.registrationId, user?.id);
    }
    setConfirmOpen(false);
    setRegisterDialogOpen(false);
    setSelectedRegistration(null);
  };

  const copyTableToClipboard = async () => {
    const headers = [
      text('Name', 'Naam'),
      ...currentEvent.questions.map((q) => text(q.question)),
    ];

    const rows = eventRegistrations?.map((registration) => {
      const answers = currentEvent.questions.map((question) => {
        const answer = registration.answers.find(
          (a) => a.questionId === question.id
        )?.answer;
        return answer ?? '';
      });
      return [
        `${registration.firstName} ${registration?.infix ?? ''} ${registration?.lastName}`,
        ...answers,
      ];
    });

    const tableText = [
      headers.join('\t'),
      ...(rows ?? []).map((row) => row.join('\t')),
    ].join('\n');

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);

    await navigator.clipboard.writeText(tableText);
  };

  return (
    <>
      {eventRegistrations && currentEvent.registrationPeriod && (
        <ContentCard className="xl:col-span-3 min-w-0">
          <div className="flex justify-between items-center">
            <h1>{text('Registrations', 'Inschrijvingen')}</h1>
            {user && (isAdminOrBoard(user.roles) || isWorga(currentEvent, user) || inCommittee(myCommittees, currentEvent.createdBy)) && (
              <Tooltip title={text('Copy Table', 'Kopieer Tabel')}>
                <IconButton onClick={copyTableToClipboard}>
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            )}
          </div>
          <p>
            <AccessAlarmIcon className=" mr-2"/>
            {`${text('Registrations close at ', 'Inschrijvingen sluiten op ')} ${moment(currentEvent.registrationPeriod.end).format('DD MMM HH:mm')}.`}
          </p>

          {user && (isAdminOrBoard(user.roles) || isChair(myCommittees, currentEvent.createdBy)) && (
            <Box className="mt-2 grid" component="form" onSubmit={(e) => {
              e.preventDefault();
              toggleRegisterDialog();
            }}>
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
            <p className="mt-2">{text('No registrations yet.', 'Nog geen deelnemers.')}</p>
          )}
        </ContentCard>
      )}

      {currentEvent && (
        <RegistrationDialog
          open={registerDialogOpen}
          toggleDialog={toggleRegisterDialog}
          name={currentEvent.name}
          questions={currentEvent.questions}
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