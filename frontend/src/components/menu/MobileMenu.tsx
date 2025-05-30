import {
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { MenuType } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import UserMenu from './UserMenu.tsx';
import { useAppState } from '../../providers/AppStateProvider.tsx';
import SettingsIcon from '@mui/icons-material/Settings';

interface MobileMenuProps {
  handleLoginOpen: () => void;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
}

export default function MobileMenu({
  handleLoginOpen,
  dropdownOpen,
  toggleDropdown
}: MobileMenuProps) {
  const { text } = useLanguage();
  const { navigate } = useAppState();
  const { isLoggedIn } = useAuth();
  const [openMenu, setOpenMenu] = useState<MenuType>(undefined);

  const toggleMenu = (menu: MenuType) => {
    if (openMenu === menu) {
      setOpenMenu(undefined);
    } else {
      setOpenMenu(menu);
    }
  };

  const navigateSubmenu = (page: string) => {
    toggleDropdown();
    setOpenMenu(undefined);
    navigate(page);
  };

  return (
    <>
      <Toolbar className="flex justify-between items-center w-full">
        <img
          src={'/images/logo.svg'}
          alt="Logo"
          className="hover:opacity-50 hover:cursor-pointer h-24"
          onClick={() => {
            if (dropdownOpen) {
              toggleDropdown();
            }
            navigate('index');
          }}
        />
        <IconButton size="large" color="inherit" onClick={toggleDropdown}>
          {dropdownOpen ? (
            <CloseIcon fontSize="large" />
          ) : (
            <MenuIcon fontSize="large" />
          )}
        </IconButton>
      </Toolbar>
      <Collapse
        in={dropdownOpen}
        timeout="auto"
        unmountOnExit
        className="relative mt-[-6rem] text-black dark:text-white bg-white dark:bg-[#121212] z-10"
      >
        <Toolbar className="flex justify-between items-center w-full">
          <img
            src={'/images/logo.svg'}
            alt="Logo"
            className="hover:opacity-50 hover:cursor-pointer h-24"
            onClick={() => {
              navigate('index');
              toggleDropdown();
            }}
          />
          <IconButton size="large" color="inherit" onClick={toggleDropdown}>
            {dropdownOpen ? (
              <CloseIcon fontSize="large" />
            ) : (
              <MenuIcon fontSize="large" />
            )}
          </IconButton>
        </Toolbar>
        <List disablePadding>
          {/* Agenda */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('agenda');
                toggleDropdown();
              }}>
              <ListItemText
                primary={text('Agenda', 'Agenda')}
                className="uppercase px-10"
              />
            </ListItemButton>
          </ListItem>

          <Divider />

          {/* Association */}
          <ListItem onClick={() => toggleMenu('association')} disablePadding>
            <ListItemButton>
              <ListItemText
                primary={text('Association', 'Vereniging')}
                className="uppercase px-10"
              />
              <ListItemIcon>
                {openMenu === 'association' ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          <Collapse
            in={openMenu === 'association'}
            timeout="auto"
            unmountOnExit
          >
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('About the NijSAC', 'Over de NijSAC')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Board', 'Bestuur')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Committees', 'Commissies')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Introduction', 'Introductie')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Climbing */}
          <ListItem onClick={() => toggleMenu('climbing')} disablePadding>
            <ListItemButton>
              <ListItemText
                primary={text('Climbing', 'Klimmen')}
                className="uppercase px-10"
              />
              <ListItemIcon>
                {openMenu === 'climbing' ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu === 'climbing'} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Indoor Climbing', 'Indoor Klimmen')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Outdoor Climbing', 'Buiten Klimmen')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Climbing Areas', 'Klimgebieden')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigateSubmenu('/material-rental')}
                >
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Material Rental', 'Materiaalverhuur')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Alps */}
          <ListItem onClick={() => toggleMenu('alps')} disablePadding>
            <ListItemButton>
              <ListItemText
                primary={text('Alps', 'Alpen')}
                className="uppercase px-10"
              />
              <ListItemIcon>
                {openMenu === 'alps' ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu === 'alps'} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItem disablePadding>
                <p className="px-14 text-sm text-gray-500 dark:text-gray-400">
                  {text('Summer', 'Zomer')}
                </p>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Mountaineering', 'Bergbeklimmen')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Canyoning', 'Canyoning')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Via Ferrata', 'Via Ferrata')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Hiking', 'Wandelen')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <p className=" px-14 text-sm text-gray-500 dark:text-gray-400">
                  {text('Winter', 'Winter')}
                </p>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Ice Climbing', 'Off Piste Skiën')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Off Piste Skiing', 'Toerskiën')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={
                      <p className="text-[#1976d2] dark:text-[#90caf9] px-14 text-sm">
                        {text('Tour Skiing', 'Canyoning')}
                      </p>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Login+Become Member / Logout */}
          {!isLoggedIn ? (
            <>
              {/* Settings */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => {navigate('settings');
                  toggleDropdown();}}>
                  <ListItemText
                    primary={text('Settings', 'Instellingen')}
                    className="uppercase px-10"
                  />
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>

              <Divider/>

              <ListItem onClick={handleLoginOpen} disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={text('Login', 'Login')}
                    className="uppercase px-10"
                  />
                  <ListItemIcon></ListItemIcon>
                </ListItemButton>
              </ListItem>
              <ListItem className="px-10 pb-3 pt-2" disablePadding>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate('register');
                    toggleDropdown();
                  }}
                >
                  {text('Become a member', 'Lid worden')}
                </Button>
              </ListItem>
            </>
          ) : (
            <div className="px-12 pb-3">
              <UserMenu />
            </div>
          )}
        </List>
      </Collapse>
    </>
  );
}
