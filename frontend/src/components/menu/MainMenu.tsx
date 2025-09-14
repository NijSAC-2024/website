import { Button, Dialog, DialogActions, DialogContent, useMediaQuery } from '@mui/material';
import LoginForm from '../LoginForm.tsx';

import DesktopMenu from './DesktopMenu.tsx';
import MobileMenu from './MobileMenu.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

export type MenuType =
  | 'association'
  | 'climbing'
  | 'alps'
  | undefined;

export default function MainMenu() {
  const { text } = useLanguage();
  const { authOpen, toggleAuthOpen } = useAuth();
  const isMobile = useMediaQuery('(max-width: 992px)');

  return (
    <>
      {isMobile ? (
        <MobileMenu/>
      ) : (
        <DesktopMenu/>
      )}
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
