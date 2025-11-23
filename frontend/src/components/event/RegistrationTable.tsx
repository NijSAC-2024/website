import {Table, TableBody, TableCell, TableRow} from '@mui/material';
import {Registration} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import RegistrationRow from './RegistrationRow.tsx';
import {inCommittee, isAdminOrBoard, isWorga} from '../../util.ts';
import {useEventRegistrations} from '../../hooks/useEventRegistrations.ts';
import {useEvents} from '../../hooks/useEvents.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';

interface RegistrationTableProps {
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationTable({onEditClick}: RegistrationTableProps) {
  const {text} = useLanguage();
  const {user} = useUsers();
  const {eventRegistrations} = useEventRegistrations();
  const {currentEvent} = useEvents();
  const {myCommittees} = useCommittees();

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <Table>
          <TableBody>
            {user && (isAdminOrBoard(user) || isWorga(currentEvent, user) || inCommittee(myCommittees, currentEvent)) && (
              <TableRow>
                <TableCell><b>{text('Name', 'Naam')}</b></TableCell>
                {currentEvent.questions.map((q) => (
                  <TableCell key={q.id}><b>{`${text(q.question)} ${q.required ? '*' : ''}`}</b></TableCell>
                ))}
                {(isAdminOrBoard(user) || inCommittee(myCommittees, currentEvent)) && (
                  <>
                    <TableCell><b>{text('Attended', 'Aanwezig')}</b>
                    </TableCell><TableCell><b>{text('Actions', 'Acties')}</b></TableCell>
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
    </div>
  );
}
