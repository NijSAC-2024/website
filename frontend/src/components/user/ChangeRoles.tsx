import {useState} from 'react';
import {IconButton, Tooltip, Menu, MenuItem, Checkbox} from '@mui/material';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {RoleType, roleOptions} from '../../types.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {isAdminOrBoard} from '../../util.ts';

export function ChangeRoles() {
  const {text} = useLanguage();
  const {user, currentUser, updateUser} = useUsers();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!user || !isAdminOrBoard(user.roles)) {
    return null;
  }

  const toggleRole = async (role: RoleType) => {
    if (!currentUser) {
      return;
    }

    const roles = currentUser.roles.includes(role)
      ? currentUser.roles.filter((r) => r !== role)
      : [...currentUser.roles, role];

    if (await updateUser(currentUser.id, {...currentUser, roles})) {
      setAnchorEl(null);
    }
  };

  return (
    <>
      <Tooltip title={text('Change role', 'Wijzig rol')}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <SwitchAccountIcon/>
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
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
