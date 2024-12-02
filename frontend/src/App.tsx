import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeMode } from './providers/ThemeProvider.tsx';
import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Success from './alerts/Success.tsx';
import Error from './alerts/Error.tsx';
import Warning from './alerts/Warning.tsx';
import Info from './alerts/Info.tsx';
import MainMenu from './components/MainMenu.tsx';

import router from './router.tsx';
import { useEffect } from 'react';
import { useLanguage } from './providers/LanguageProvider.tsx';

export default function App() {
  const { themeCookie, toggleTheme } = useThemeMode();
  const language = useLanguage();

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

  // DEBUG: on "ctrl-,", flip the theme, on "ctrl-.", flip the language
  const eventListener = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === ',') {
      toggleTheme();
    }

    if (e.ctrlKey && e.key === '.') {
      language.toggleLanguage();
    }
  };

  if (import.meta.env.MODE === 'development') {
    useEffect(() => {
      addEventListener('keydown', eventListener);

      return () => {
        removeEventListener('keydown', eventListener);
      };
    });
  }

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
