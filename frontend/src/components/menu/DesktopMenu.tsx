import {Button, Menu, MenuItem, Toolbar, Tooltip} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserMenu from './UserMenu.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {MouseEvent, useEffect, useState} from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import {useThemeMode} from '../../providers/ThemeProvider.tsx';
import {useNavigate} from 'react-router-dom';
import {MenuType} from '../../types.ts';
import {useAuth} from '../../providers/AuthProvider.tsx';

interface DesktopMenuProps {
  setShowLogin: (show: boolean) => void;
}

export default function DesktopMenu({setShowLogin}: DesktopMenuProps) {
  const {text} = useLanguage();
  const navigate = useNavigate();
  const {user} = useAuth()
  const {checkDarkMode} = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<MenuType>(undefined);
  const [offset, setOffset] = useState<number>(window.scrollY);
  const isDarkMode = checkDarkMode();

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, {passive: true});
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
    <div
      className={`${offset === 0 ? 'bg-transparent text-white' : 'bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(18,18,18,0.9)] shadow-lg  dark:text-white'} fixed transition-all duration-200 ease-in-out z-10 w-full`}>
      <Toolbar className="flex justify-between w-[80%] max-w-[1050px] mx-auto">
        <div className="flex items-center">
          <img
            src={'/images/logo.svg'}
            alt="Logo"
            className={`hover:opacity-50 hover:cursor-pointer h-24 mr-4 ${offset !== 0 && !isDarkMode && 'invert'} transition-all duration-200 ease-in-out`}
            onClick={() => navigate('/')}
          />
          <Button color="inherit" onClick={() => navigate('/events')}>
            {text('Agenda', 'Agenda')}
          </Button>

          {/* Association Dropdown */}
          <Button
            color="inherit"
            className="flex items-center"
            onClick={(e) => handleMenuOpen(e, 'association')}
          >
            {text('Association', 'Vereniging')} <ExpandMoreIcon/>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={openMenu === 'association'}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigateSubmenu('/nijsac')}>
              {text('About the NijSAC', 'Over de NijSAC')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/board')}>
              {text('Board', 'Bestuur')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/committees')}>
              {text('Committees', 'Commissies')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/introduction')}>
              {text('Introduction', 'Introductie')}
            </MenuItem>
          </Menu>

          {/* Climbing Dropdown */}
          <Button
            color="inherit"
            className="flex items-center"
            onClick={(e) => handleMenuOpen(e, 'climbing')}
          >
            {text('Climbing', 'Klimmen')} <ExpandMoreIcon/>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={openMenu === 'climbing'}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigateSubmenu('/indoor-climbing')}>
              {text('Indoor Climbing', 'Indoor Klimmen')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/outdoor-climbing')}>
              {text('Outdoor Climbing', 'Buiten Klimmen')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/climbing-areas')}>
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
            {text('Alpinism', 'Alpineren')} <ExpandMoreIcon/>
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
            <MenuItem onClick={() => navigateSubmenu('/moutaineering')}>
              {text('Mountaineering', 'Bergbeklimmen')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/canyoning')}>
              {text('Canyoning', 'Canyoning')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/via-ferrata')}>
              {text('Via Ferrata', 'Via Ferrata')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/hiking')}>
              {text('Hiking', 'Wandelen')}
            </MenuItem>
            {/* Winter */}
            <p className="px-3 py-1 mt-2 text-gray-500">
              {text('Winter', 'Winter')}
            </p>
            <MenuItem onClick={() => navigateSubmenu('/ice-climbing')}>
              {text('Ice Climbing', 'Ijsklimmen')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/off-piste-skiing')}>
              {text('Off Piste Skiing', 'Off Piste Skiën')}
            </MenuItem>
            <MenuItem onClick={() => navigateSubmenu('/tour-skiing')}>
              {text('Tour Skiing', 'Toerskiën')}
            </MenuItem>
          </Menu>
        </div>
        <div className="flex items-center">
          {!user ? (
            <>
              {/* Settings Dropdown */}
              <Tooltip title={text('Settings', 'Instellingen')}>
                <Button
                  color="inherit"
                  className="flex items-center"
                  onClick={() => navigate('/settings')}
                >
                  <SettingsIcon/>
                </Button>
              </Tooltip>

              {/* Login+Become Member / Logout */}
              <Button color="inherit" onClick={() => setShowLogin(true)}>
                {text('Login', 'Inloggen')}
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                {text('Become a member', 'Lid worden')}
              </Button>
            </>
          ) : (
            <UserMenu/>
          )}
        </div>
      </Toolbar>
    </div>
  );
}
