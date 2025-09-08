import ContentCard from '../ContentCard.tsx';
import {Checkbox, Table, TableBody, TableCell, TableRow} from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { Question } from '../../types.ts';
import moment from 'moment/moment';
import {useApiState} from '../../providers/ApiProvider.tsx';

interface RegistrationsCardProps {
  questions: Question[];
}

export default function RegistrationsCard({ questions }: RegistrationsCardProps) {
  const { registrations, event, updateRegistration } = useApiState();
  const { text } = useLanguage();
  const { user } = useAuth();

  return (
    <>
      {!!user && event?.requiredMembershipStatus.includes(user?.status) && (
        <ContentCard className="xl:col-span-3 p-7">
          <h1>{text('Participants', 'Deelnemers')}</h1>
          {registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <Table>
                  <TableBody>
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
                        <TableCell>
                          <b>{text('Attended', 'Aanwezig')}</b>
                        </TableCell>
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
                        {user?.roles.includes('admin') && questions.map((question) => {
                          const answer = registration.answers?.find(
                            (a) => a.questionId === question.id)?.answer;

                          if (question.questionType.type === 'boolean') {
                            return (
                              <TableCell key={`${registration.registrationId}-${question.id}`}>
                                {answer === 'true' ? '✔️' : '❌'}
                              </TableCell>
                            );
                          }

                          if (question.questionType.type === 'date') {
                            return (
                              <TableCell key={`${registration.registrationId}-${question.id}`}>
                                {moment(answer).format('DD MMM HH:mm')}
                              </TableCell>
                            );
                          }

                          return (
                            <TableCell key={`${registration.registrationId}-${question.id}`}>
                              {answer || ''}
                            </TableCell>
                          );
                        })}
                        {user?.roles.includes('admin') && (
                          <TableCell key={registration.registrationId}>
                            <Checkbox checked={registration.attended} onChange={(_, checked) => updateRegistration(event?.id, registration.registrationId, registration.answers, checked)}/>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="mt-2">{text('No registrations yet', 'Nog geen deelnemers')}</p>
          )}
        </ContentCard>
      )}
    </>
  );
}
