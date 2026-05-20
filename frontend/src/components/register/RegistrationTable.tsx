import {Table, TableBody, TableCell, TableRow} from '@mui/material';
import {Registration} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import RegistrationRow from './RegistrationRow.tsx';
import {inCommittee, isAdminOrBoard, isChair, isWorga} from '../../util.ts';
import {useEventRegistrationHook} from '../../hooks/useEventRegistrationHook.ts';
import {useEventHook} from '../../hooks/useEventHook.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useParams} from 'react-router-dom';
import {useAuth} from '../../providers/AuthProvider.tsx';

interface RegistrationTableProps {
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationTable({onEditClick}: RegistrationTableProps) {
  const {text} = useLanguage();
  const {useUserCommittees} = useUserHook();
  const {user} = useAuth()
  const myCommittees = useUserCommittees(user?.id);
  const {useEventRegistrations} = useEventRegistrationHook();
  const {eventId} = useParams();
  const eventRegistrations = useEventRegistrations(eventId)
  const {useEvent} = useEventHook();
  const currentEvent = useEvent(eventId);

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-max">
        <TableBody>
          {user && (isAdminOrBoard(user.roles) || isWorga(currentEvent, user) || inCommittee(myCommittees, currentEvent.createdBy)) && (
            <TableRow>
              <TableCell><b>{text('Name', 'Naam')}</b></TableCell>
              {currentEvent.questions.map((q) => (
                <TableCell
                  key={q.id}><b>{`${text(q.question)} ${q.required ? '*' : ''}`}</b></TableCell>
              ))}
              {(isAdminOrBoard(user.roles) || isChair(myCommittees, currentEvent.createdBy)) && (
                <>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: 80,
                      backgroundColor: 'background.paper',
                    }}
                  ><b>{text('Attended', 'Aanwezig')}</b></TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: 'background.paper',
                    }}
                  ><b>{text('Actions', 'Acties')}</b></TableCell>
                </>
              )}
            </TableRow>
          )}
          {eventRegistrations?.map((r) => (
            <RegistrationRow
              key={r.id}
              registration={r}
              onEditClick={onEditClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
