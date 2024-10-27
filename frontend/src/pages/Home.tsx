import { Alert, AlertTitle, Button, Switch } from '@mui/material';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useTheme } from '../providers/ThemeProvider.tsx';
import { enqueueSnackbar } from 'notistack';
import MainMenu from '../components/MainMenu.tsx';

export default function Home() {
  const { isLoggedIn } = useAuth();
  const { themeCookie, toggleTheme } = useTheme();

  const handleTestToken = async () => {
    const response = await fetch('/api/whoami');
    switch (response.status) {
      case 200: {
        const body = await response.json();
        enqueueSnackbar('Your email is: ' + body.email, {
          variant: 'success'
        });
        break;
      }
      case 401:
        enqueueSnackbar('Please log in and try again.', {
          variant: 'error'
        });
        break;
      default:
        enqueueSnackbar('Something went wrong. Please try again later.', {
          variant: 'error'
        });
    }
  };

  return (
    <>
      <MainMenu />
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="grid grid-cols-2 grid-flow-row gap-4 w-1/3">
          <Button variant="contained" onClick={handleTestToken}>
            Test Token
          </Button>
          <Alert severity="info" variant="outlined" className="col-span-2">
            <AlertTitle>Are you logged in?</AlertTitle>
            <p className="text-xl">{isLoggedIn ? 'Yes, you are.' : 'No, you are not.'}</p>
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
    </>
  );
}
