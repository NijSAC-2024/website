import { Button, Switch } from '@mui/material';
import { useThemeMode } from '../providers/ThemeProvider.tsx';
import { enqueueSnackbar } from 'notistack';
import { text } from '../util.ts';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';

export default function Home() {
  const { language: lang } = useLanguage();
  const { isDarkMode, toggleTheme } = useThemeMode();

  const handleTestToken = async () => {
    const response = await fetch('/api/whoami');
    switch (response.status) {
    case 200: {
      const body = await response.json();
      enqueueSnackbar('Your email is: ' + body.email, {
        variant: 'success',
      });
      break;
    }
    case 401:
      enqueueSnackbar('Please log in and try again.', {
        variant: 'error',
      });
      break;
    default:
      enqueueSnackbar('Something went wrong. Please try again later.', {
        variant: 'error',
      });
    }
  };

  return (
    <GenericPage>
      <ContentCard className="grid gap-5 p-7">
        <h2>
          {text(
            lang,
            'Welcome to the NijSAC website.',
            'Welkom op de NijSAC website.',
          )}
        </h2>
        <Button variant="contained" onClick={handleTestToken}>
          Test token
        </Button>
        <div className="grid grid-cols-3">
          <h3 className="mx-auto">{text(lang, 'Light mode', 'Licht thema')}</h3>
          <Switch
            className="mx-auto"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <h3 className="mx-auto">{text(lang, 'Dark mode', 'Donker thema')}</h3>
        </div>
      </ContentCard>
    </GenericPage>
  );
}
