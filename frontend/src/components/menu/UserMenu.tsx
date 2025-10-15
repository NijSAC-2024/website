import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { MouseEvent, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {useAppState} from '../../providers/AppStateProvider.tsx';
import GroupIcon from '@mui/icons-material/Group';

interface UserMenuProps {
  toggleDropdown?: () => void;
}

export default function UserMenu({toggleDropdown}: UserMenuProps) {
  const { text } = useLanguage();
  const { user, logout } = useAuth();
  const { navigate } = useAppState();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateSubmenu = (page: string) => {
    if (page === 'user' && user) {
      navigate('user', { id: user?.id });
    } else {
      navigate(page);
    }
    handleMenuClose();
    if (toggleDropdown) {
      toggleDropdown();
    }
  };
  return (
    <>
      <Tooltip title={text('Account settings', 'Account instellingen')}>
        <IconButton onClick={handleClick}>
          <Avatar className="w-8 h-8">{user?.firstName.charAt(0).toUpperCase()}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        className="shadow "
      >
        <MenuItem onClick={() => navigateSubmenu('user')}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          {text('My account', 'Mijn account')}
        </MenuItem>
        <MenuItem disabled={user?.status === 'pending'} onClick={() => navigateSubmenu('members')}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          {text('Members', 'Leden')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigateSubmenu('settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {text('Settings', 'Instellingen')}
        </MenuItem>
        <MenuItem onClick={() => {
          if (toggleDropdown) {
            toggleDropdown();
          }
          logout();
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {text('Logout', 'Uitloggen')}
        </MenuItem>
      </Menu>
    </>
  );
}
