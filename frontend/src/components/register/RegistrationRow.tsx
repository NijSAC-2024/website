import {Checkbox, TableCell, TableRow, IconButton, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import moment from 'moment';
import {Registration} from '../../types.ts';
import {inCommittee, isAdminOrBoard, isChair, isWorga} from '../../util.ts';
import {useEventHook} from '../../hooks/useEventHook.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useEventRegistrationHook} from '../../hooks/useEventRegistrationHook.ts';
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '../../providers/AuthProvider.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

interface RegistrationRowProps {
  registration: Registration;
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationRow({registration, onEditClick}: RegistrationRowProps) {
  const {eventId} = useParams();
  const {useEvent} = useEventHook();
  const currentEvent = useEvent(eventId)
  const {useUserCommittees} = useUserHook();
  const {user} = useAuth()
  const myCommittees = useUserCommittees(user?.id)
  const {updateRegistration} = useEventRegistrationHook();
  const navigate = useNavigate();
  const {text} = useLanguage();

  if (!currentEvent) {
    return null;
  }

  const canViewDetailedRegistration = !!user && (isAdminOrBoard(user.roles) || isWorga(currentEvent, user) || inCommittee(myCommittees, currentEvent.createdBy));
  const canManageRegistration = !!user && (isAdminOrBoard(user.roles) || (isChair(myCommittees, currentEvent.createdBy)));
  const displayName = `${registration.firstName} ${registration.infix ?? ''} ${registration.lastName} ${canViewDetailedRegistration && !!registration.guestEmail? `(${registration.guestEmail})` : ''}`;

  return (
    <TableRow sx={{'&:last-child td, &:last-child th': {border: 0}}} key={registration.id}>
      <TableCell>
        {<p className="hover:cursor-pointer hover:opacity-60 transition-all duration-100"
          onClick={() => registration.userId && user && navigate(`/user/${registration.userId}`)}>
          <Tooltip title={canViewDetailedRegistration && registration.waitingListPosition !== null && registration.waitingListPosition !== undefined ? `${text('Queue position: ', 'Wachtlijst positie:')} ${registration.waitingListPosition + 1}` : ''}>
            <span>
              {canViewDetailedRegistration && registration.waitingListPosition !== null ? (
                <span className="text-[#1976d2] dark:text-[#90caf9]">
                  {`${displayName}`}
                </span>
              ) : (
                displayName
              )}
            </span>
          </Tooltip>
        </p>}
      </TableCell>

      {canViewDetailedRegistration && currentEvent?.questions.map((q) => {
        const answer = registration.answers?.find((a) => a.questionId === q.id)?.answer;

        if (q.questionType.type === 'boolean') {
          return <TableCell
            key={`${registration.id}-${q.id}`}>{answer === 'true' ? '✔️' : '❌'}</TableCell>;
        }
        if (q.questionType.type === 'date') {
          return <TableCell
            key={`${registration.id}-${q.id}`}>{moment(answer).format('DD MMM HH:mm')}</TableCell>;
        }
        return <TableCell key={`${registration.id}-${q.id}`}>{answer || ''}</TableCell>;
      })}

      {(canManageRegistration) && (
        <>
          <TableCell
            sx={{
              position: 'sticky',
              right: 80,
              backgroundColor: 'background.paper',
            }}
          >
            <Checkbox
              checked={registration.attended || false}
              onChange={(_, checked) => updateRegistration(currentEvent.id, registration.id, registration.answers ?? [], checked, registration.waitingListPosition)}
              disabled={!canManageRegistration}
            />
          </TableCell>
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              backgroundColor: 'background.paper',
            }}
          >
            <IconButton onClick={() => onEditClick(registration)}
              disabled={!canManageRegistration}>
              <EditIcon/>
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
