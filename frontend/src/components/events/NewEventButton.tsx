import {Fab} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useNavigate} from 'react-router-dom';

export default function NewEventButton() {
  const {text} = useLanguage();
  const {useAuthUser, useUserCommittees} = useUserHook();
  const user = useAuthUser();
  const myCommittees = useUserCommittees(user?.id)
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  if (isAdminOrBoard(user.roles) || myCommittees?.some(uc => uc.left == null)) {
    return (
      <div className="fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary" onClick={() => navigate('/events/new')}>
          <AddIcon className="mr-2"/>
          {text('Add event', 'Voeg evenement toe')}
        </Fab>
      </div>
    );
  } else {
    return null;
  }
}