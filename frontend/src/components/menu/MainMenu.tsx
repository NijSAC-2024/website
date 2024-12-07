import { useState, useEffect } from 'react';
import { Button, DialogContent, Dialog, DialogActions, useMediaQuery } from '@mui/material';
import LoginForm from '../LoginForm.tsx';
import { text } from '../../util.ts';

import DesktopMenu from './DesktopMenu.tsx';
import MobileMenu from './MobileMenu.tsx';

export default function MainMenu() {
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(window.scrollY);
  const isMobile = useMediaQuery('(max-width: 992px)');

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLoginOpen = () => {
    setAuthOpen(true);
  };
  const handleClose = () => {
    setAuthOpen(false);
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
            handleLoginOpen={handleLoginOpen}
            dropdownOpen={dropdownOpen}
            toggleDropdown={toggleDropdown}
          />
        ) : (
          <DesktopMenu handleLoginOpen={handleLoginOpen} />
        )}
      </div>
      <Dialog open={authOpen} onClose={handleClose} fullWidth>
        <DialogContent>
          <LoginForm onClose={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{text('Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
