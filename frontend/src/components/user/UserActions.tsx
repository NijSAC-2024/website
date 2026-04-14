import {useState, MouseEvent} from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
} from '@mui/material';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {RoleType, roleOptions} from '../../types.ts';
import GroupIcon from '@mui/icons-material/Group';
import {isAdminOrBoard, isChair} from '../../util.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';


export default function UserActions() {
  const {text} = useLanguage();
  const {user} = useUsers();
  const {myCommittees, currentCommittees, committees, addUserToCommittee, deleteUserFromCommittee} = useCommittees();
  const {currentUser, updateUser} = useUsers();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [committeeAnchor, setCommitteeAnchor] = useState<null | HTMLElement>(null);

  console.log(myCommittees)

  if (!user || !(isAdminOrBoard(user.roles) || isChair(myCommittees, user.id))) {
    return null;
  }

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
    if (!currentUser) {
      return;
    }
    const newRoles = currentUser.roles.includes(role)
      ? currentUser.roles.filter((r) => r !== role)
      : [...currentUser.roles, role];

    if (await updateUser(currentUser.id, {...currentUser, roles: newRoles})) {
      handleClose();
    }
  };

  const toggleCommittee = async (committeeId: string) => {
    if (!currentUser) {
      return;
    }
    const inCommittee = currentCommittees.some((c) => c.committeeId === committeeId && c.left == null);

    if (inCommittee) {
      await deleteUserFromCommittee(committeeId, currentUser.id);
    } else {
      await addUserToCommittee(committeeId, currentUser.id);
    }
    handleClose();
  };

  return (
    <>
      <div className="flex">
        <Tooltip title={text('Change committees', 'Wijzig commissies')}>
          <IconButton onClick={(e) => handleCommitteeMenuOpen(e)}>
            <GroupIcon/>
          </IconButton>
        </Tooltip>

        <Tooltip title={text('Change role', 'Wijzig rol')}>
          <IconButton onClick={(e) => handleRoleMenuOpen(e)}>
            <SwitchAccountIcon/>
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
          const inCommittee = currentCommittees.some((c) => c.committeeId === committee.id && c.left == null);
          return (
            <MenuItem
              key={committee.id}
              onClick={() => toggleCommittee(committee.id)}
            >
              <Checkbox checked={inCommittee} size="small"/>
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
              checked={currentUser?.roles.includes(role.id as RoleType) || false}
              size="small"
            />
            {text(role.label)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
