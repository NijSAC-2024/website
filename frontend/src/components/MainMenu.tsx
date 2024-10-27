import { Button, useTheme } from '@mui/material';
import UserMenu from './UserMenu.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import AuthDialog from './AuthDialog.tsx';
import { useState } from 'react';

export default function MainMenu() {
  const theme = useTheme();
  const { isLoggedIn, checkAuth } = useAuth();

  checkAuth();

  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);
  const handleAuthOpen = () => setAuthDialogOpen(true);
  const handleAuthClose = () => setAuthDialogOpen(false);

  return (
    <>
      <div
        className="w-screen h-20 p-4 flex justify-between items-center fixed"
        style={{ backgroundColor: theme.palette.secondary.main }}>
        <p className="text-lg font-semibold">NijSAC</p>
        {isLoggedIn ? (
          <UserMenu />
        ) : (
          <Button variant="contained" onClick={handleAuthOpen}>
            Login/Signup
          </Button>
        )}
      </div>
      <AuthDialog open={authDialogOpen} onClose={handleAuthClose} />
    </>
  );
}
