import Link from '../Link.tsx';
import { Fab } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider.tsx';
import AddIcon from '@mui/icons-material/Add';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

export default function NewEventButton() {
  const { text } = useLanguage();
  const { isLoggedIn, user } = useAuth();


  if (isLoggedIn && (user?.roles.includes('admin') || user?.roles.includes('activityCommissionMember'))) {
    return (<div className="fixed bottom-5 right-5 z-10">
      <Link routeName={'new_event'}>
        <Fab variant="extended" color="primary">
          <AddIcon className="mr-2" />
          <p>{text('Add event', 'Voeg evenement toe')}</p>
        </Fab>
      </Link>
    </div>);
  }

  return <></>;
}