import { Alert, AlertTitle, Button, Switch } from '@mui/material';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useThemeMode } from '../providers/ThemeProvider.tsx';
import { enqueueSnackbar } from 'notistack';
import Text from '../components/Text.tsx';

export default function Home() {
  const { isLoggedIn } = useAuth();
  const { themeCookie, toggleTheme } = useThemeMode();

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
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="grid grid-cols-2 grid-flow-row gap-4 w-1/3">
          <Button variant="contained" onClick={handleTestToken}>
            <Text english={'Test Token'} dutch={'Test token'} />
          </Button>
          <Alert severity="info" variant="outlined" className="col-span-2">
            <AlertTitle>
              <Text english={'Are you logged in?'} dutch={'Ben je ingelogd?'} />
            </AlertTitle>
            <p className="text-xl">
              {isLoggedIn ? (
                <Text english={'Yes, you are.'} dutch={'Ja, dat ben je'} />
              ) : (
                <Text english={'No, you are not.'} dutch={'Nee, dat ben je niet.'} />
              )}
            </p>
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
