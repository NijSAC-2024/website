import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeMode } from './providers/ThemeProvider.tsx';
import { SnackbarProvider } from 'notistack';
import Success from './components/alerts/Success.tsx';
import Error from './components/alerts/Error.tsx';
import Warning from './components/alerts/Warning.tsx';
import Info from './components/alerts/Info.tsx';
import MainMenu from './components/menu/MainMenu.tsx';

import { useLanguage } from './providers/LanguageProvider.tsx';
import { parseLocation } from './router.ts';
import Home from './pages/Home.tsx';
import Signup from './pages/Signup.tsx';
import Agenda from './pages/Agenda.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import { useAppState } from './providers/AppStateProvider.tsx';
import Event from './pages/Event.tsx';
import Settings from './pages/Settings.tsx';
import Account from './pages/Account.tsx';
import EditEvent from './components/edit/EditEvent.tsx';

export default function App(): React.ReactElement {
  const { navigate, route } = useAppState();
  const { themeMode, checkDarkMode, setTheme } = useThemeMode();
  const isDarkMode = checkDarkMode();
  const language = useLanguage();

  const darkTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: '0.5rem 1rem',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            '& .MuiPaper-root': {
              borderRadius: 16,
              padding: '0.6rem',
              background: isDarkMode ? '#121212' : 'white',
              borderBottom: isDarkMode
                ? '2px solid #90caf9'
                : '3px solid #1976d2',
            },
            '& .MuiBackdrop-root': {
              backgroundColor: isDarkMode
                ? 'rgb(0,0,0,0.5)'
                : 'rgb(255,255,255,0.5)',
            },
          },
        },
      },
    },
  });

  // DEBUG: on "ctrl-,", flip the theme, on "ctrl-.", flip the language
  const eventListener = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === ',') {
      if (themeMode == 'dark') {
        setTheme('light');
      }
      else if (themeMode == 'light') {
        setTheme('dark');
      }
    }

    if (e.ctrlKey && e.key === '.') {
      language.toggleLanguage();
    }
  };

  useEffect(() => {
    addEventListener('keydown', eventListener);

    return () => {
      removeEventListener('keydown', eventListener);
    };
  });

  useEffect(() => {
    // Listen to browser back and forward buttons
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.route !== window.location.pathname) {
        navigate(event.state.route.name, event.state.route.params);
      }
    });
  }, []);

  useEffect(() => {
    // Update route on page load
    try {
      const newRoute = parseLocation(window.location);
      if (route.name !== newRoute.name || route.params !== newRoute.params) {
        if (newRoute) {
          navigate(newRoute.name, newRoute.params);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      navigate('home_not_found');
    }
  }, []);

  let component: React.ReactElement;
  if (route.name == 'index') {
    component = <Home />;
  } else if (route.name.startsWith('register')) {
    component = <Signup />;
  } else if (route.name == 'agenda') {
    component = <Agenda />;
  } else if (route.name == 'event') {
    component = <Event />;
  } else if (route.name == 'edit_event' || route.name == 'new_event') {
    component = <EditEvent />;
  } else if (route.name == 'settings') {
    component = <Settings />;
  } else if (route.name == 'account') {
    component = <Account />;
  } else {
    console.log('not found');
    component = <ErrorPage error={'Page not found'} />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MainMenu />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={5000}
        preventDuplicate
        Components={{
          success: Success,
          error: Error,
          warning: Warning,
          info: Info,
        }}
      />
      {component}
    </ThemeProvider>
  );
}
