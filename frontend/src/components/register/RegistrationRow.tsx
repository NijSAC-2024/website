import { Checkbox, TableCell, TableRow, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import moment from 'moment';
import { Question, Registration, User } from '../../types.ts';
import {useApiState} from '../../providers/ApiProvider.tsx';

interface RegistrationRowProps {
  registration: Registration;
  questions: Question[];
  user: User | null;
  eventId: string;
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationRow({ registration, questions, user, eventId, onEditClick }: RegistrationRowProps) {
  const { updateRegistration } = useApiState()
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{`${registration.firstName} ${registration.infix ?? ''} ${registration.lastName}`}</TableCell>

      {user?.roles.includes('admin') && questions.map((q) => {
        const answer = registration.answers?.find((a) => a.questionId === q.id)?.answer;

        if (q.questionType.type === 'boolean') {
          return <TableCell key={`${registration.registrationId}-${q.id}`}>{answer === 'true' ? '✔️' : '❌'}</TableCell>;
        }
        if (q.questionType.type === 'date') {
          return <TableCell key={`${registration.registrationId}-${q.id}`}>{moment(answer).format('DD MMM HH:mm')}</TableCell>;
        }
        return <TableCell key={`${registration.registrationId}-${q.id}`}>{answer || ''}</TableCell>;
      })}

      {user?.roles.includes('admin') && (
        <>
          <TableCell>
            <Checkbox
              checked={registration.attended}
              onChange={(_, checked) => updateRegistration(eventId, registration.registrationId, registration.answers, checked)}
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
