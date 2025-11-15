import {useState, MouseEvent, useEffect} from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
} from '@mui/material';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {User, RoleType, roleOptions} from '../../types.ts';
import GroupIcon from '@mui/icons-material/Group';
import {isAdminOrBoard} from '../../util.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';


export default function UserActions() {
  const { text } = useLanguage();
  const { user } = useUsers();
  const {myCommittees, committees} = useCommittees();
  const {state: {routerState: {params}}} = useWebsite();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [committeeAnchor, setCommitteeAnchor] = useState<null | HTMLElement>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  useEffect(() => {
    if (!!user && !(params.user_id === user?.id)) {
      getUser(params.user_id).then((u) => {
        if (u) {
          setViewUser(u);
        }
      });
    } else if (user) {
      setViewUser(user);
    }
  }, [params, user]);

  if (!user || !isAdminOrBoard(user)) {return null;}

  const handleRoleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCommitteeMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setCommitteeAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCommitteeAnchor(null);
  };

  const toggleRole = async (role: RoleType) => {
    if (!viewUser) {return;}
    const newRoles = viewUser.roles.includes(role)
      ? viewUser.roles.filter((r) => r !== role)
      : [...viewUser.roles, role];

    await updateUser(viewUser.id, { ...viewUser, roles: newRoles });
    setViewUser({ ...viewUser, roles: newRoles });
    handleClose();
  };

  const toggleCommittee = async (committeeId: string) => {
    if (!viewUser) {return;}
    const inCommittee = myCommittees.some((c) => c.committeeId === committeeId && c.left == null);

    if (inCommittee) {
      await removeUserFromCommittee(committeeId, viewUser.id,);
    } else {
      await addUserToCommittee(committeeId, viewUser.id, );
    }
    handleClose();
  };

  return (
    <>
      <div className="flex">
        <Tooltip title={text('Change committees', 'Wijzig commissies')}>
          <IconButton onClick={(e) => handleCommitteeMenuOpen(e)}>
            <GroupIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={text('Change role', 'Wijzig rol')}>
          <IconButton onClick={(e) => handleRoleMenuOpen(e)}>
            <SwitchAccountIcon />
          </IconButton>
        </Tooltip>
      </div>

      {/* Committee menu */}
      <Menu
        anchorEl={committeeAnchor}
        open={Boolean(committeeAnchor)}
        onClose={handleClose}
      >
        {committees.map((committee) => {
          const inCommittee = myCommittees.some((c) => c.committeeId === committee.id && c.left == null);
          return (
            <MenuItem
              key={committee.id}
              onClick={() => toggleCommittee(committee.id)}
            >
              <Checkbox checked={inCommittee} size="small" />
              {text(committee.name)}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Role menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {roleOptions.map((role) => (
          <MenuItem
            key={role.label.en}
            onClick={() => toggleRole(role.id as RoleType)}
          >
            <Checkbox
              checked={viewUser?.roles.includes(role.id as RoleType) || false}
              size="small"
            />
            {text(role.label)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
