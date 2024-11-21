import { Alert, AlertTitle, Button, Switch } from '@mui/material';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useThemeMode } from '../providers/ThemeProvider.tsx';
import { enqueueSnackbar } from 'notistack';
import text from '../util.ts';

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
            {text('Test Token', 'Test token')}
          </Button>
          <Alert severity="info" variant="outlined" className="col-span-2">
            <AlertTitle>{text('Are you logged in?', 'Ben je ingelogd?')}</AlertTitle>
            <p className="text-xl">
              {isLoggedIn
                ? text('Yes, you are.', 'Ja, dat ben je.')
                : text('No, you are not.', 'Nee, dat ben je niet.')}
            </p>
          </Alert>
          <Alert severity="info" variant="outlined" className="col-span-2">
            <AlertTitle>
              {text('What theme do you prefer?', 'Welke thema heeft je voorkeur?')}
            </AlertTitle>
            <div className="grid grid-cols-3 grid-flow-row gap-4">
              <p className="text-xl text-center">{text('Light mode', 'Lichte modus')}</p>
              <Switch className="m-auto" checked={themeCookie.theme} onChange={toggleTheme} />
              <p className="text-xl text-center">{text('Dark mode', 'Donkere modus')}</p>
            </div>
          </Alert>
        </div>
      </div>
    </>
  );
}
