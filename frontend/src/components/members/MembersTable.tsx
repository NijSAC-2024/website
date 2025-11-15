import {useState, useMemo} from 'react';
import {
  Table, TableBody, TableCell, TableRow,
  TablePagination, TextField
} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider';
import ContentCard from '../ContentCard.tsx';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';

export default function MembersTable() {
  const {text} = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('')
  const {navigate} = useWebsite();
  const {users} = useUsers();

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) =>
        `${u.firstName} ${u.infix ?? ''} ${u.lastName}`.toLowerCase().includes(q),
      )
      .sort((a, b) =>
        `${a.firstName} ${a.infix ?? ''} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.infix ?? ''} ${b.lastName}`,
        ),
      );
  }, [users, search]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);
  return (
    <ContentCard className="grid gap-4">
      <h1 className="text-3xl">{text('Members', 'Leden')}</h1>
      <TextField
        label={text('Search', 'Zoeken')}
        fullWidth
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />

      <Table>
        <TableBody>
          {paginatedUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center justify-between">
                  <span className="hover:cursor-pointer hover:opacity-60 transition-all duration-100"
                    onClick={() => navigate('user', {user_id: u.id})}>{`${u.firstName} ${u.infix ?? ''} ${u.lastName}`}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage={text('Rows per page:', 'Rijen per pagina:')}
        labelDisplayedRows={({from, to, count}) =>
          `${from}-${to} ${text('of', 'van')} ${count !== -1 ? count : `${text('more than', 'meer dan')} ${to}`}`
        }
      />
    </ContentCard>
  );
}
