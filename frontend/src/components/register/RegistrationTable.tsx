import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { Question, Registration } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import RegistrationRow from './RegistrationRow.tsx';
import {useAuth} from '../../providers/AuthProvider.tsx';

interface RegistrationTableProps {
  registrations: Registration[];
  questions: Question[];
  eventId: string;
  onEditClick: (registration: Registration) => void;
}

export default function RegistrationTable({ registrations, questions, eventId, onEditClick }: RegistrationTableProps) {
  const { text } = useLanguage();
  const { user } = useAuth()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <Table>
          <TableBody>
            {questions.length > 0 && user?.roles.includes('admin') && (
              <TableRow>
                <TableCell><b>{text('Name', 'Naam')}</b></TableCell>
                {questions.map((q) => (
                  <TableCell key={q.id}><b>{`${text(q.question)} ${q.required ? '*' : ''}`}</b></TableCell>
                ))}
                <TableCell><b>{text('Attended', 'Aanwezig')}</b></TableCell>
                <TableCell><b>{text('Actions', 'Acties')}</b></TableCell>
              </TableRow>
            )}
            {registrations.map((r) => (
              <RegistrationRow
                key={r.userId}
                registration={r}
                questions={questions}
                eventId={eventId}
                onEditClick={onEditClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
