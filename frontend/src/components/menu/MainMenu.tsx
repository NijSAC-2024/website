import {Button, Dialog, DialogActions, DialogContent, useMediaQuery} from '@mui/material';
import LoginForm from '../LoginForm.tsx';

import DesktopMenu from './DesktopMenu.tsx';
import MobileMenu from './MobileMenu.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useState} from 'react';

export type MenuType =
  | 'association'
  | 'climbing'
  | 'alps'
  | undefined;

export default function MainMenu() {
  const {text} = useLanguage();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {isMobile ? (
        <MobileMenu setShowLogin={setShowLogin}/>
      ) : (
        <DesktopMenu setShowLogin={setShowLogin}/>
      )}
      <Dialog open={showLogin} onClose={() => setShowLogin(false)} fullWidth>
        <DialogContent>
          <LoginForm close={() => {
            setShowLogin(false)
          }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogin(false)}>
            {text('Close', 'Sluit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
