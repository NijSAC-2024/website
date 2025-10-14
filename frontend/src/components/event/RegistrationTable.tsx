import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { Registration } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import RegistrationRow from './RegistrationRow.tsx';
import {useAuth} from '../../providers/AuthProvider.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useApiState} from '../../providers/ApiProvider.tsx';

interface RegistrationTableProps {
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationTable({ onEditClick }: RegistrationTableProps) {
  const { text } = useLanguage();
  const { user } = useAuth()
  const { event, registrations } = useApiState()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <Table>
          <TableBody>
            {isAdminOrBoard(user) && (
              <TableRow>
                <TableCell><b>{text('Name', 'Naam')}</b></TableCell>
                {event?.questions.map((q) => (
                  <TableCell key={q.id}><b>{`${text(q.question)} ${q.required ? '*' : ''}`}</b></TableCell>
                ))}
                <TableCell><b>{text('Attended', 'Aanwezig')}</b></TableCell>
                <TableCell><b>{text('Actions', 'Acties')}</b></TableCell>
              </TableRow>
            )}
            {registrations?.map((r) => (
              <RegistrationRow
                key={r.userId}
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
