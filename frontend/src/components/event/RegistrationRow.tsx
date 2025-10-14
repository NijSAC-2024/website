import { Checkbox, TableCell, TableRow, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import moment from 'moment';
import { Registration } from '../../types.ts';
import {useApiState} from '../../providers/ApiProvider.tsx';
import {useAuth} from '../../providers/AuthProvider.tsx';
import {useAppState} from '../../providers/AppStateProvider.tsx';
import {isAdminOrBoard} from '../../util.ts';

interface RegistrationRowProps {
  registration: Registration;
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationRow({ registration, onEditClick }: RegistrationRowProps) {
  const { updateRegistration, event } = useApiState()
  const { user } = useAuth()
  const { navigate } = useAppState()
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        {<p className="hover:cursor-pointer hover:opacity-60 transition-all duration-100" onClick={() => registration.userId && navigate('user', { id: registration.userId})}>
          {isAdminOrBoard(user) && registration.waitingListPosition !== undefined?
            <span className="text-[#1976d2] dark:text-[#90caf9]">{`${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}</span> 
            : `${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}
        </p>}
      </TableCell>

      {isAdminOrBoard(user) && event?.questions.map((q) => {
        const answer = registration.answers?.find((a) => a.questionId === q.id)?.answer;

        if (q.questionType.type === 'boolean') {
          return <TableCell key={`${registration.registrationId}-${q.id}`}>{answer === 'true' ? '✔️' : '❌'}</TableCell>;
        }
        if (q.questionType.type === 'date') {
          return <TableCell key={`${registration.registrationId}-${q.id}`}>{moment(answer).format('DD MMM HH:mm')}</TableCell>;
        }
        return <TableCell key={`${registration.registrationId}-${q.id}`}>{answer || ''}</TableCell>;
      })}

      {event && isAdminOrBoard(user) && (
        <>
          <TableCell>
            <Checkbox
              checked={registration.attended}
              onChange={(_, checked) => updateRegistration(event?.id, registration.registrationId, registration.answers, checked, registration.waitingListPosition)}
            />
          </TableCell>
          <TableCell>
            <IconButton onClick={() => onEditClick(registration)}>
              <Edit />
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
