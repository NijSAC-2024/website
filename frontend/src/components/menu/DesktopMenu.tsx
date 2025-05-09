import { Button, Menu, MenuItem, Toolbar } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserMenu from './UserMenu.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { MouseEvent, useState } from 'react';
import { MenuType } from '../../types.ts';
import Link from '../Link.tsx';
import { useAppState } from '../../providers/AppStateProvider.tsx';

interface DesktopMenuProps {
  handleLoginOpen: () => void;
}

export default function DesktopMenu({ handleLoginOpen }: DesktopMenuProps) {
  const { text, setEnglish, setDutch } = useLanguage();
  const { navigate } = useAppState();
  const { isLoggedIn } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<MenuType>(undefined);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>, menu: MenuType) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(menu);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
    setOpenMenu(undefined);
  };

  const navigateSubmenu = (page: string) => {
    navigate(page);
    handleMenuClose();
  };

  return (
    <Toolbar className="flex justify-between w-[80%] max-w-[1000px] mx-auto">
      <div className="flex items-center">
        <Link routeName={'home'}>
          <img
            src={'/images/logo.svg'}
            alt="Logo"
            className="hover:opacity-50 hover:cursor-pointer h-24 mr-4"
          />
        </Link>
        <Button color="inherit" onClick={() => navigate('agenda')}>
          {text('Agenda', 'Agenda')}
        </Button>

        {/* Association Dropdown */}
        <Button
          color="inherit"
          className="flex items-center"
          onClick={(e) => handleMenuOpen(e, 'association')}
        >
          {text('Association', 'Vereniging')} <ExpandMoreIcon />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openMenu === 'association'}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            {text('About the NijSAC', 'Over de NijSAC')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Board', 'Bestuur')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Committees', 'Commissies')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Introduction', 'Introductie')}
          </MenuItem>
        </Menu>

        {/* Climbing Dropdown */}
        <Button
          color="inherit"
          className="flex items-center"
          onClick={(e) => handleMenuOpen(e, 'climbing')}
        >
          {text('Climbing', 'Klimmen')} <ExpandMoreIcon />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openMenu === 'climbing'}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            {text('Indoor Climbing', 'Indoor Klimmen')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Outdoor Climbing', 'Buiten Klimmen')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Climbing Areas', 'Klimgebieden')}
          </MenuItem>
          <MenuItem onClick={() => navigateSubmenu('/material-rental')}>
            {text('Material Rental', 'Materiaalverhuur')}
          </MenuItem>
        </Menu>

        {/* Alps Dropdown */}
        <Button
          color="inherit"
          className="flex items-center"
          onClick={(e) => handleMenuOpen(e, 'alps')}
        >
          {text('Alps', 'Alpen')} <ExpandMoreIcon />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openMenu === 'alps'}
          onClose={handleMenuClose}
        >
          {/* Summer */}
          <p className="px-3 py-1 text-gray-500">
            {text('Summer', 'Zomer')}
          </p>
          <MenuItem onClick={handleMenuClose}>
            {text('Mountaineering', 'Bergbeklimmen')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Canyoning', 'Canyoning')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Via Ferrata', 'Via Ferrata')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Hiking', 'Wandelen')}
          </MenuItem>
          {/* Winter */}
          <p className="px-3 py-1 mt-2 text-gray-500">
            {text('Winter', 'Winter')}
          </p>
          <MenuItem onClick={handleMenuClose}>
            {text('Ice Climbing', 'Ijsklimmen')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Off Piste Skiing', 'Off Piste Skiën')}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {text('Tour Skiing', 'Toerskiën')}
          </MenuItem>
        </Menu>
      </div>
      <div className="flex items-center">
        {/* Language Dropdown */}
        <Button
          color="inherit"
          className="flex items-center"
          onClick={(e) => handleMenuOpen(e, 'language')}
        >
          {text('EN', 'NL')}
          <ExpandMoreIcon />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openMenu === 'language'}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              setEnglish();
              handleMenuClose();
            }}
          >
            English
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDutch();
              handleMenuClose();
            }}
          >
            Nederlands
          </MenuItem>
        </Menu>

        {/* Login+Become Member / Logout */}
        {!isLoggedIn ? (
          <>
            <Button color="inherit" onClick={handleLoginOpen}>
              {text('Login', 'Inloggen')}
            </Button>
            <Button variant="contained" onClick={() => navigate('register')}>
              {text('Become a member', 'Lid worden')}
            </Button>
          </>
        ) : (
          <UserMenu />
        )}
      </div>
    </Toolbar>
  );
}
