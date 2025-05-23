import ContentCard from '../ContentCard.tsx';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useApiState } from '../../providers/ApiProvider.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';

export default function RegistrationsCard() {
  const { registrations } = useApiState();
  const { text } = useLanguage();
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && (
        <ContentCard className="xl:col-span-3 p-7">
          <h1>{text('Participants', 'Deelnemers')}</h1>
          <Table>
            <TableBody>
              {registrations?.map((registration) => (
                <TableRow
                  key={registration.userId}
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0
                    }
                  }}
                >
                  <TableCell>{registration.firstName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
      )}
    </>
  );
}
