import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';

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
import Location from './pages/Location.tsx';
import EditCommittee from './components/committee/EditCommittee.tsx';
import ErrorPage from './error/ErrorPage.tsx';
import { WebsiteError } from './error/error.ts';

import ThemeProvider, { useThemeMode } from './providers/ThemeProvider.tsx';
import LanguageProvider, { useLanguage } from './providers/LanguageProvider.tsx';

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import MainMenu from './components/menu/MainMenu.tsx';

import { SnackbarProvider } from 'notistack';
import Success from './components/alerts/Success.tsx';
import Warning from './components/alerts/Warning.tsx';
import Info from './components/alerts/Info.tsx';
import Error from './components/alerts/Error.tsx';
import ErrorBoundary from './error/ErrorBoundary.tsx';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      throwOnError: true,
    },
  },
});

function AppLayout() {
  const { themeMode, checkDarkMode, setTheme } = useThemeMode();
  const isDarkMode = checkDarkMode();
  const language = useLanguage();

  const theme = createTheme({
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

  // Debug shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ',') {
        setTheme(themeMode === 'dark' ? 'light' : 'dark');
      }
      if (e.ctrlKey && e.key === '.') {
        language.toggleLanguage();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [themeMode, setTheme, language]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
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
      <MainMenu />
      <Outlet />
    </MuiThemeProvider>
  );
}

export function App() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      ErrorBoundary.setError?.(event.error || event.message);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      ErrorBoundary.setError?.(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CookiesProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ErrorBoundary>
                <Routes>
                  <Route element={<AppLayout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/register" element={<Signup/>}/>

                    <Route path="/events" element={<Events/>}/>
                    <Route path="/events/new" element={<EditEvent/>}/>
                    <Route path="/events/:eventId" element={<Event/>}/>
                    <Route path="/events/:eventId/edit" element={<EditEvent/>}/>

                    <Route path="/settings" element={<Settings/>}/>

                    <Route path="/user/:userId" element={<User/>}/>

                    <Route path="/members" element={<Members/>}/>

                    <Route path="/committees" element={<Committees/>}/>
                    <Route path="/committees/new" element={<EditCommittee/>}/>
                    <Route path="/committees/:committeeId" element={<Committee/>}/>
                    <Route path="/committees/:committeeId/edit" element={<EditCommittee/>}/>

                    <Route path="/location" element={<Location/>}/>

                    <Route path="/about" element={<h1>About</h1>}/>
                    <Route path="/material_rental" element={<h1>Material Rental</h1>}/>

                    {/* 404 fallback */}
                    <Route
                      path="*"
                      element={
                        <ErrorPage
                          error={new WebsiteError('Page not found.', 404)}
                        />
                      }
                    />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </LanguageProvider>
          </ThemeProvider>
        </CookiesProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
  ;
}