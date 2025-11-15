import {JSX, useEffect} from 'react';
import {RouteName} from './routes.ts';
import Home from './pages/Home.tsx';
import Signup from './pages/Signup.tsx';
import Events from './pages/Events.tsx';
import Event from './pages/Event';
import EditEvent from './components/edit/EditEvent.tsx';
import Settings from './pages/Settings.tsx';
import User from './pages/User.tsx';
import Members from './pages/Members.tsx';
import Committees from './pages/Committees.tsx';
import Committee from './pages/Committee.tsx';
import EditCommittee from './components/committee/EditCommittee.tsx';
import {useWebsite} from './hooks/useState.ts';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainMenu from './components/menu/MainMenu.tsx';
import {SnackbarProvider} from 'notistack';
import Success from './components/alerts/Success.tsx';
import Warning from './components/alerts/Warning.tsx';
import Info from './components/alerts/Info.tsx';
import Error from './components/alerts/Error.tsx';

import {useThemeMode} from './providers/ThemeProvider.tsx';
import {useLanguage} from './providers/LanguageProvider.tsx';
import ErrorPage from './error/ErrorPage.tsx';

const PageContent: { [key in RouteName]: JSX.Element | null } = {
  index: <Home/>,
  register: <Signup/>,
  events: <Events/>,
  'events.event': <Event/>,
  'events.event.edit': <EditEvent/>,
  'events.new': <EditEvent/>,
  settings: <Settings/>,
  user: <User/>,
  members: <Members/>,
  committees: <Committees/>,
  'committees.committee': <Committee/>,
  'committees.new': <EditCommittee/>,
  'committees.committee.edit': <EditCommittee/>,
  about: <h1>About</h1>,
  material_rental: <h1>Material Rental</h1>
};


export function Pages() {
  const {
    state: {error, routerState},
  } = useWebsite();

  // TODO move theming to separate file
  const {themeMode, checkDarkMode, setTheme} = useThemeMode();
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
      } else if (themeMode == 'light') {
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

  if (error) {
    return <ErrorPage error={error}/>;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <MainMenu/>
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
      {PageContent[routerState.name]}
    </ThemeProvider>
  );

}
