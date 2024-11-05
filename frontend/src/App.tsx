import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeMode } from './providers/ThemeProvider.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import Home from './pages/Home.tsx';
import { SnackbarProvider } from 'notistack';
import Success from './alerts/Success.tsx';
import Error from './alerts/Error.tsx';
import Warning from './alerts/Warning.tsx';
import Info from './alerts/Info.tsx';
import MainMenu from './components/MainMenu.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />
  }
]);

export default function App() {
  const { themeCookie } = useThemeMode();

  const darkTheme = createTheme({
    palette: {
      mode: themeCookie.theme ? 'dark' : 'light'
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 35,
            padding: '0.5rem 1rem'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: 35
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MainMenu />
      <RouterProvider router={router} />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={5000}
        preventDuplicate
        Components={{
          success: Success,
          error: Error,
          warning: Warning,
          info: Info
        }}
      />
    </ThemeProvider>
  );
}
