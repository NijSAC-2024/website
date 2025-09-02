import ContentCard from '../ContentCard.tsx';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { Question } from '../../types.ts';
import { useEvents } from '../../hooks/useEvents.ts';
import moment from 'moment/moment';

interface RegistrationsCardProps {
  questions: Question[];
}

export default function RegistrationsCard({ questions }: RegistrationsCardProps) {
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
                      <b>{`${text(question.question)} ${question.required ? '*' : ''}`}</b>
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
                  {questions.map((question) => {
                    const answer = registration.answers?.find(
                      (a) => a.questionId === question.id)?.answer;

                    if (question.questionType.type === 'boolean') {
                      return (
                        <TableCell key={`${registration.userId}-${question.id}`}>
                          {answer === 'true' ? '✔️' : '❌'}
                        </TableCell>
                      );
                    }

                    if (question.questionType.type === 'date') {
                      console.log(answer);
                      return (
                        <TableCell key={`${registration.userId}-${question.id}`}>
                          {moment(answer).format('DD MMM HH:mm')}
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={`${registration.userId}-${question.id}`}>
                        {answer || ''}
                      </TableCell>
                    );
                  })}

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
      )}
    </>
  );
}
