import { Alert, AlertTitle, Button, Switch } from '@mui/material';
import AuthDialog from '../components/AuthDialog.tsx';
import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useTheme } from '../providers/ThemeProvider.tsx';
import { useAlert } from '../providers/AlertProvider.tsx';

export default function Home() {
  const { authCookie, logout, checkAuth } = useAuth();
  const { themeCookie, toggleTheme } = useTheme();
  const { changeAlert } = useAlert();
  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);
  const handleAuthOpen = () => setAuthDialogOpen(true);
  const handleAuthClose = () => setAuthDialogOpen(false);

  const handleTestToken = async () => {
    const response = await fetch('http://localhost:8080/api/test', {
      headers: { Authorization: 'Bearer ' + authCookie.token }
    });
    switch (response.status) {
      case 200:
        const email = await response.json();
        changeAlert({
          title: 'It worked!',
          text: 'Your email is: ' + email,
          severity: 'success'
        });
        break;
      case 401:
        changeAlert({
          title: 'Unauthorized user',
          text: 'Please log in and try again..',
          severity: 'error'
        });
        break;
      case 500:
        changeAlert({
          title: 'Internal Server Error',
          text: 'Something went wrong. Please try again later.',
          severity: 'error'
        });
        break;
      default:
        changeAlert({
          title: 'Error',
          text: 'Something went wrong. Please try again later.',
          severity: 'error'
        });
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="grid grid-cols-2 grid-flow-row gap-4 w-1/3">
          {checkAuth() ? (
            <Button variant="contained" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button variant="contained" onClick={handleAuthOpen}>
              Login/Signup
            </Button>
          )}

          <Button variant="contained" onClick={handleTestToken}>
            Test Token
          </Button>
          <Alert severity="info" variant="outlined" className="col-span-2">
            <AlertTitle>Are you logged in?</AlertTitle>
            <p className="text-xl">{checkAuth() ? 'Yes, you are.' : 'No, you are not.'}</p>
          </Alert>
          <Alert severity="info" variant="outlined" className="col-span-2">
            <AlertTitle>What theme do you prefer?</AlertTitle>
            <div className="grid grid-cols-3 grid-flow-row gap-4">
              <p className="text-xl text-center">Light mode</p>
              <Switch className="m-auto" checked={themeCookie.theme} onChange={toggleTheme} />
              <p className="text-xl text-center">Dark mode</p>
            </div>
          </Alert>
        </div>
      </div>
      <AuthDialog open={authDialogOpen} onClose={handleAuthClose} />
    </>
  );
}
