import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './providers/ThemeProvider.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import Home from './pages/Home.tsx';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { useAlert } from './providers/AlertProvider.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />
  }
]);

export default function App() {
  const { themeCookie } = useTheme();
  const { open, alert, handleClose } = useAlert();

  const darkTheme = createTheme({
    palette: {
      mode: themeCookie.theme ? 'dark' : 'light'
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={alert?.severity} variant="filled">
          <AlertTitle>{alert?.title}</AlertTitle>
          {alert?.text}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
