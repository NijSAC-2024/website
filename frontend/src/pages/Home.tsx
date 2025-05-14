import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';

export default function Home() {
  const { text } = useLanguage();

  const handleTestToken = async () => {
    const response = await fetch('/api/whoami');
    switch (response.status) {
    case 200: {
      const body = await response.json();
      console.log(body);
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
    <GenericPage>
      <ContentCard className="grid gap-5 p-7">
        <h2>
          {text('Welcome to the NijSAC website.', 'Welkom op de NijSAC website.')}
        </h2>
        <Button variant="contained" onClick={handleTestToken}>
          Test token
        </Button>
      </ContentCard>
    </GenericPage>
  );
}
