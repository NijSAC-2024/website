import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { MouseEvent, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {useAppState} from '../../providers/AppStateProvider.tsx';

export default function UserMenu() {
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
    navigate(page);
    handleMenuClose();
  };
  return (
    <>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          className="ml-2"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          {text('My account', 'Mijn account')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigateSubmenu('settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {text('Settings', 'Instellingen')}
        </MenuItem>
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {text('Logout', 'Uitloggen')}
        </MenuItem>
      </Menu>
    </>
  );
}
