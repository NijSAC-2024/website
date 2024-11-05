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
import Text from '../components/Text.tsx';

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
              <Text english="Agenda" dutch="Agenda" />
            </Button>

            {/* Association Dropdown */}
            <Button
              color="inherit"
              className="flex items-center"
              onClick={(e) => handleMenuOpen(e, 'association')}>
              <Text english="Association" dutch="Vereniging" /> <ExpandMoreIcon />
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu === 'association'} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>
                <Text english="About the NijSAC" dutch="Over de NijSAC" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Board" dutch="Bestuur" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Committees" dutch="Commissies" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Introduction" dutch="Introductie" />
              </MenuItem>
            </Menu>

            {/* Climbing Dropdown */}
            <Button
              color="inherit"
              className="flex items-center"
              onClick={(e) => handleMenuOpen(e, 'climbing')}>
              <Text english="Climbing" dutch="Klimmen" /> <ExpandMoreIcon />
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu === 'climbing'} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Indoor Climbing" dutch="Indoor Klimmen" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Outdoor Climbing" dutch="Buiten Klimmen" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Climbing Areas" dutch="Klimgebieden" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Material Rental" dutch="Materiaalverhuur" />
              </MenuItem>
            </Menu>

            {/* Alps Dropdown */}
            <Button
              color="inherit"
              className="flex items-center"
              onClick={(e) => handleMenuOpen(e, 'alps')}>
              <Text english="Alps" dutch="Alpen" /> <ExpandMoreIcon />
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu === 'alps'} onClose={handleMenuClose}>
              {/* Summer */}
              <p className="px-3 py-1 text-gray-500">
                <Text english="Summer" dutch="Zomer" />
              </p>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Mountaineering" dutch="Bergbeklimmen" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Canyoning" dutch="Canyoning" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Via Ferrata" dutch="Via Ferrata" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Hiking" dutch="Wandelen" />
              </MenuItem>
              {/* Winter */}
              <p className="px-3 py-1 mt-2 text-gray-500">
                <Text english="Winter" dutch="Winter" />
              </p>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Ice Climbing" dutch="IJsklimmen" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Off Piste Skiing" dutch="Off Piste Skiën" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Text english="Tour Skiing" dutch="Toerskiën" />
              </MenuItem>
            </Menu>
          </div>

          <div className="flex space-x-4">
            {/* Language Dropdown */}
            <Button
              color="inherit"
              className="flex items-center"
              onClick={(e) => handleMenuOpen(e, 'language')}>
              <Text english="EN/NL" dutch="EN/NL" /> <ExpandMoreIcon />
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu === 'language'} onClose={handleMenuClose}>
              <MenuItem
                onClick={() => {
                  setEnglish();
                  handleMenuClose();
                }}>
                English
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setDutch();
                  handleMenuClose();
                }}>
                Nederlands
              </MenuItem>
            </Menu>
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <>
                {/* Login */}
                <Button color="inherit" onClick={handleLoginOpen}>
                  <Text english="Login" dutch="Inloggen" />
                </Button>
                {/* Become a Member */}
                <Button variant="contained" onClick={handleSignupOpen}>
                  <Text english="Become a member" dutch="Lid worden" />
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
