import {Checkbox, TableCell, TableRow, IconButton} from '@mui/material';
import {Edit} from '@mui/icons-material';
import moment from 'moment';
import {Registration} from '../../types.ts';
import {isAdminOrBoard} from '../../util.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useEvents} from '../../hooks/useEvents.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';

interface RegistrationRowProps {
  registration: Registration;
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationRow({registration, onEditClick}: RegistrationRowProps) {
  const {currentEvent} = useEvents();
  const {user} = useUsers();
  const {navigate} = useWebsite();
  const {updateRegistration} = useEventRegistrations();

  if (!currentEvent) {
    return null;
  }

  return (
    <TableRow sx={{'&:last-child td, &:last-child th': {border: 0}}}>
      <TableCell>
        {<p className="hover:cursor-pointer hover:opacity-60 transition-all duration-100"
          onClick={() => registration.id && navigate('user', {user_id: registration.id})}>
          {user && isAdminOrBoard(user) && registration.waitingListPosition !== undefined ?
            <span
              className="text-[#1976d2] dark:text-[#90caf9]">{`${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}</span>
            : `${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}
        </p>}
      </TableCell>

      {user && isAdminOrBoard(user) && currentEvent?.questions.map((q) => {
        const answer = registration.answers?.find((a) => a.questionId === q.id)?.answer;

        if (q.questionType.type === 'boolean') {
          return <TableCell key={`${registration.registrationId}-${q.id}`}>{answer === 'true' ? '✔️' : '❌'}</TableCell>;
        }
        if (q.questionType.type === 'date') {
          return <TableCell
            key={`${registration.registrationId}-${q.id}`}>{moment(answer).format('DD MMM HH:mm')}</TableCell>;
        }
        return <TableCell key={`${registration.registrationId}-${q.id}`}>{answer || ''}</TableCell>;
      })}

      {user && isAdminOrBoard(user) && (
        <>
          <TableCell>
            <Checkbox
              checked={registration.attended || false}
              onChange={(_, checked) => updateRegistration(currentEvent.id, registration.registrationId, registration.answers, checked, registration.waitingListPosition)}
            />
          </TableCell>
          <TableCell>
            <IconButton onClick={() => onEditClick(registration)}>
              <Edit/>
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
