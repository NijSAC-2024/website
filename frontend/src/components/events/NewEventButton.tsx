import {Fab} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';

export default function NewEventButton() {
  const {text} = useLanguage();
  const {user} = useUsers();
  const {myCommittees} = useCommittees();
  const {navigate} = useWebsite();

  if (!user) {
    return null;
  }

  if (isAdminOrBoard(user) || myCommittees.some(uc => uc.left == null)) {
    return (
      <div className="fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary" onClick={() => navigate('events.new')}>
          <AddIcon className="mr-2"/>
          {text('Add event', 'Voeg evenement toe')}
        </Fab>
      </div>
    );
  } else {
    return null;
  }
}