import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, useMediaQuery } from '@mui/material';
import LoginForm from '../LoginForm.tsx';

import DesktopMenu from './DesktopMenu.tsx';
import MobileMenu from './MobileMenu.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

export default function MainMenu() {
  const { text } = useLanguage();
  const { authOpen, toggleAuthOpen } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(window.scrollY);
  const isMobile = useMediaQuery('(max-width: 992px)');

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        className={
          (offset === 0 && !dropdownOpen
            ? 'bg-transparent text-white'
            : 'bg-white dark:bg-[#121212] shadow-lg text-black dark:text-white') +
          ' fixed transition-all duration-200 ease-in-out z-10 w-full'
        }
      >
        {isMobile ? (
          <MobileMenu
            handleLoginOpen={toggleAuthOpen}
            dropdownOpen={dropdownOpen}
            toggleDropdown={toggleDropdown}
          />
        ) : (
          <DesktopMenu handleLoginOpen={toggleAuthOpen} />
        )}
      </div>
      <Dialog open={authOpen} onClose={toggleAuthOpen} fullWidth>
        <DialogContent>
          <LoginForm onClose={toggleAuthOpen} />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleAuthOpen}>
            {text('Close', 'Sluit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
