import React from 'react';
import ContentCard from '../ContentCard.tsx';
import { text } from '../../util.ts';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { registrationsType } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface RegistrationsCardProps {
  allowsRegistrations: boolean;
}

export default function RegistrationsCard({ allowsRegistrations }: RegistrationsCardProps) {
  const { language: lang } = useLanguage();
  const { isLoggedIn } = useAuth();

  const registrations: registrationsType = {
    registrations: [
      {
        eid: 1,
        name: 'Lukas Nieuweboer'
      },
      {
        eid: 2,
        name: 'Asia Piotrowska'
      },
      {
        eid: 3,
        name: 'Robin Put'
      }
    ]
  };

  return (
    <>
      {allowsRegistrations && isLoggedIn && (
        <ContentCard className="xl:col-span-3 p-7">
          <h1>{text(lang, 'Participants', 'Deelnemers')}</h1>
          <Table>
            <TableBody>
              {registrations.registrations.map((registraton) => (
                <TableRow
                  key={registraton.eid}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{registraton.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
      )}
    </>
  );
}
