import { useState, MouseEvent } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  DialogContent,
  Dialog,
  Backdrop,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logo from '../../public/images/logo.svg';
import { useAuth } from '../providers/AuthProvider.tsx';
import UserMenu from './UserMenu.tsx';
import LoginForm from './LoginForm.tsx';
import SignupForm from './SignupForm.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import text from '../util.ts';

type MenuName = 'association' | 'climbing' | 'alps' | 'language' | undefined;

export default function MainMenu() {
  const { isLoggedIn, checkAuth } = useAuth();
  const { setEnglish, setDutch } = useLanguage();
  const [loading, setLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<MenuName>(undefined);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [login, setLogin] = useState<boolean>(false);
  const handleLoginOpen = () => {
    setAuthOpen(true);
    setLogin(true);
  };
  const handleSignupOpen = () => {
    setAuthOpen(true);
    setLogin(false);
  };
  const handleClose = () => {
    setAuthOpen(false);
  };

  checkAuth();

  const handleMenuOpen = (event: MouseEvent<HTMLElement>, menu: MenuName) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(menu);
  };
  const handleMenuClose = () => {
    setAnchorEl(undefined);
    setOpenMenu(undefined);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar className="flex justify-between w-1/2 m-auto">
          {/* Menu Items */}
          <div className="flex items-center">
            {/* Logo Section */}
            <img
              src={logo}
              alt="Logo"
              className="hover:opacity-50 hover:cursor-pointer h-24 mr-4"
              onClick={() => alert('Navigate to Home')}
            />
            <Button color="inherit" onClick={() => alert('Navigate to Agenda')}>
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
            <Menu anchorEl={anchorEl} open={openMenu === 'association'} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>
                {text('About the NijSAC', 'Over de NijSAC')}
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Board', 'Bestuur')}</MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Committees', 'Commissies')}</MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Introduction', 'Introductie')}</MenuItem>
            </Menu>

            {/* Climbing Dropdown */}
            <Button
              color="inherit"
              className="flex items-center"
              onClick={(e) => handleMenuOpen(e, 'climbing')}
            >
              {text('Climbing', 'Klimmen')} <ExpandMoreIcon />
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu === 'climbing'} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>
                {text('Indoor Climbing', 'Indoor Klimmen')}
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                {text('Outdoor Climbing', 'Buiten Klimmen')}
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                {text('Climbing Areas', 'Klimgebieden')}
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
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
            <Menu anchorEl={anchorEl} open={openMenu === 'alps'} onClose={handleMenuClose}>
              {/* Summer */}
              <p className="px-3 py-1 text-gray-500">{text('Summer', 'Zomer')}</p>
              <MenuItem onClick={handleMenuClose}>
                {text('Mountaineering', 'Bergbeklimmen')}
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Canyoning', 'Canyoning')}</MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Via Ferrata', 'Via Ferrata')}</MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Hiking', 'Wandelen')}</MenuItem>
              {/* Winter */}
              <p className="px-3 py-1 mt-2 text-gray-500">{text('Winter', 'Winter')}</p>
              <MenuItem onClick={handleMenuClose}>{text('Ice Climbing', 'IJsklimmen')}</MenuItem>
              <MenuItem onClick={handleMenuClose}>
                {text('Off Piste Skiing', 'Off Piste Skiën')}
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>{text('Tour Skiing', 'Toerskiën')}</MenuItem>
            </Menu>
          </div>

          <div className="flex space-x-4">
            {/* Language Dropdown */}
            <Button
              color="inherit"
              className="flex items-center"
              onClick={(e) => handleMenuOpen(e, 'language')}
            >
              {text('Language', 'Taal')}
              <ExpandMoreIcon />
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu === 'language'} onClose={handleMenuClose}>
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
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <>
                {/* Login */}
                <Button color="inherit" onClick={handleLoginOpen}>
                  {text('Login', 'Inloggen')}
                </Button>
                {/* Become a Member */}
                <Button variant="contained" onClick={handleSignupOpen}>
                  {text('Become a member', 'Lid worden')}
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Dialog open={authOpen} onClose={handleClose} fullWidth>
        <DialogContent>
          {login ? (
            <LoginForm onClose={handleClose} setLoading={setLoading} />
          ) : (
            <SignupForm onClose={handleClose} setLoading={setLoading} />
          )}
          <Backdrop open={loading}>
            <CircularProgress />
          </Backdrop>
        </DialogContent>
      </Dialog>
    </>
  );
}
