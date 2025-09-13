import {useState, useMemo, MouseEvent} from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  TablePagination, TextField, IconButton, Tooltip, Menu, MenuItem, Checkbox, Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { useLanguage } from '../../providers/LanguageProvider';
import {User, RoleType, roleOptions} from '../../types';
import {useApiState} from '../../providers/ApiProvider.tsx';
import {useAuth} from '../../providers/AuthProvider.tsx';
import UserDetails from '../UserDetails.tsx';
import ContentCard from '../ContentCard.tsx';

interface MembersTableProps {
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
}

export default function MembersTable({
  expanded,
  toggleExpand,
}: MembersTableProps) {
  const { users, updateUser } = useApiState()
  const { user } = useAuth()
  const { text } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, u: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(u);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const toggleRole = async (role: RoleType) => {
    if (!selectedUser) {return;}

    const newRoles = selectedUser.roles.includes(role)
      ? selectedUser.roles.filter((r) => r !== role)
      : [...selectedUser.roles, role];

    await updateUser(selectedUser.id, { ...selectedUser, roles: newRoles });
    setSelectedUser({ ...selectedUser, roles: newRoles }); // optimistic update
  };

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
        <TableHead>
          <TableRow>
            <TableCell>
              <b>{text('Name', 'Naam')}</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center justify-between">
                  <span>{`${u.firstName} ${u.infix ?? ''} ${u.lastName}`}</span>
                  {user?.roles.includes('admin') && (
                    <div>
                      <Tooltip title={expanded[u.id] ? text('Less info', 'Minder info') : text('More info', 'Meer info')}>
                        <IconButton onClick={() => toggleExpand(u.id)}>
                          {expanded[u.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={text('Change role', 'Wijzig rol')}>
                        <IconButton onClick={(e) => handleMenuOpen(e, u)}>
                          <SwitchAccountIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                </div>
                {user?.roles.includes('admin') && (
                  <Collapse in={expanded[u.id]} timeout="auto" unmountOnExit>
                    <UserDetails user={u}/>
                  </Collapse>
                )}
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
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${text('of', 'van')} ${count !== -1 ? count : `${text('more than', 'meer dan')} ${to}`}`
        }
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {roleOptions.map((role) => (
          <MenuItem key={role.label.en} onClick={() => toggleRole(role.id as RoleType)}>
            <Checkbox
              checked={selectedUser?.roles.includes(role.id as RoleType) || false}
              size="small"
            />
            {text(role.label)}
          </MenuItem>
        ))}
      </Menu>
    </ContentCard>
  );
}
