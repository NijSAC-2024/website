import {Button, Menu, MenuItem, Toolbar, Tooltip} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserMenu from './UserMenu.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {MouseEvent, useEffect, useState} from 'react';
import Link from '../Link.tsx';
import { useAppState } from '../../providers/AppStateProvider.tsx';
import SettingsIcon from '@mui/icons-material/Settings';
import {useThemeMode} from '../../providers/ThemeProvider.tsx';
import {MenuType} from './MainMenu.tsx';

export default function DesktopMenu() {
  const { text } = useLanguage();
  const { navigate } = useAppState();
  const { checkDarkMode } = useThemeMode()
  const { isLoggedIn, toggleAuthOpen } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<MenuType>(undefined);
  const [offset, setOffset] = useState<number>(window.scrollY);
  const isDarkMode = checkDarkMode();

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <div className={`${offset === 0 ? 'bg-transparent text-white' : 'bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(18,18,18,0.9)] shadow-lg  dark:text-white'} fixed transition-all duration-200 ease-in-out z-10 w-full`}>
      <Toolbar className="flex justify-between w-[80%] max-w-[1050px] mx-auto">
        <div className="flex items-center">
          <Link routeName={'index'}>
            <img
              src={'/images/logo.svg'}
              alt="Logo"
              className={`hover:opacity-50 hover:cursor-pointer h-24 mr-4 ${offset !== 0 && !isDarkMode && 'invert'} transition-all duration-200 ease-in-out`}
            />
          </Link>
          <Button color="inherit" onClick={() => navigate('events')}>
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
            <MenuItem onClick={() => navigateSubmenu('committees')}>
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
            {text('Alpinism', 'Alpineren')} <ExpandMoreIcon />
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
          {/* Login+Become Member / Logout */}
          {!isLoggedIn ? (
            <>
              {/* Settings Dropdown */}
              <Tooltip title={text('Settings', 'Instellingen')}>
                <Button
                  color="inherit"
                  className="flex items-center"
                  onClick={() => navigate('settings')}
                >
                  <SettingsIcon />
                </Button>
              </Tooltip>

              <Button color="inherit" onClick={toggleAuthOpen}>
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
    </div>
  );
}
