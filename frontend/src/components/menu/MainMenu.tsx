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
  const [offset, setOffset] = useState<number>(window.scrollY);
  const isMobile = useMediaQuery('(max-width: 992px)');

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        className={
          (offset === 0
            ? 'bg-transparent text-white'
            : 'bg-white dark:bg-[#121212] shadow-lg text-black dark:text-white') +
          ' fixed transition-all duration-200 ease-in-out z-10 w-full'
        }
      >
        {isMobile ? (
          <MobileMenu/>
        ) : (
          <DesktopMenu/>
        )}
      </div>
      <Dialog open={authOpen} onClose={toggleAuthOpen} fullWidth>
        <DialogContent>
          <LoginForm />
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
