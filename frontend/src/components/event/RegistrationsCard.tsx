import ContentCard from '../ContentCard.tsx';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import {Question} from '../../types.ts';
import { useEvents } from '../../hooks/useEvents.ts';

interface RegistrationsCardProps {
  questions: Question[];
}

export default function RegistrationsCard({questions}: RegistrationsCardProps) {
  const { registrations } = useEvents();
  const { text } = useLanguage();
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      {isLoggedIn && (
        <ContentCard className="xl:col-span-3 p-7">
          <h1>{text('Participants', 'Deelnemers')}</h1>
          <Table>
            <TableBody>
              {/* TODO: proper access management */}
              {questions.length > 0 && user?.roles.includes('admin') && (
                <TableRow>
                  <TableCell>
                    <b>{text('Name', 'Naam')}</b>
                  </TableCell>
                  {questions.map((question) => (
                    <TableCell key={question.id}>
                      <b>{text(question.question)}</b>
                    </TableCell>
                  ))}
                </TableRow>
              )}
              {registrations?.map((registration) => (
                <TableRow
                  key={registration.userId}
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0
                    }
                  }}
                >
                  <TableCell>{`${registration?.firstName} ${registration?.infix ?? ''} ${registration?.lastName}`}</TableCell>
                  {registration.answers?.map((answer) => (
                    <TableCell key={answer.answer}>
                      {answer.answer}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
      )}
    </>
  );
}
