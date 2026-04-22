import {Table, TableBody, TableCell, TableRow} from '@mui/material';
import {Registration} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import RegistrationRow from './RegistrationRow.tsx';
import {inCommittee, isAdminOrBoard, isChair, isWorga} from '../../util.ts';
import {useEventRegistrationHook} from '../../hooks/useEventRegistrationHook.ts';
import {useEventHook} from '../../hooks/useEventHook.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useParams} from 'react-router-dom';

interface RegistrationTableProps {
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationTable({onEditClick}: RegistrationTableProps) {
  const {text} = useLanguage();
  const {useAuthUser, useUserCommittees} = useUserHook();
  const user = useAuthUser();
  const myCommittees = useUserCommittees(user?.id);
  const {useEventRegistrations} = useEventRegistrationHook();
  const params = useParams();
  const eventRegistrations = useEventRegistrations(params.eventId)
  const {useEvent} = useEventHook();
  const currentEvent = useEvent(params.eventId);

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <Table>
          <TableBody>
            {user && (isAdminOrBoard(user.roles) || isWorga(currentEvent, user) || inCommittee(myCommittees ?? [], currentEvent.createdBy)) && (
              <TableRow>
                <TableCell><b>{text('Name', 'Naam')}</b></TableCell>
                {currentEvent.questions.map((q) => (
                  <TableCell key={q.id}><b>{`${text(q.question)} ${q.required ? '*' : ''}`}</b></TableCell>
                ))}
                {(isAdminOrBoard(user.roles) || isChair(myCommittees ?? [], currentEvent.createdBy)) && (
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
