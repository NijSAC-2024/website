import { Button, Collapse, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from '../AreYouSure.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {useAppState} from '../../providers/AppStateProvider.tsx';
import {useApiState} from '../../providers/ApiProvider.tsx';

interface SaveButtonProps {
  id: string;
  handleSave: () => void;
}

export default function SaveButton({ id, handleSave }: SaveButtonProps) {
  const { text } = useLanguage();
  const { deleteCommittee } = useApiState();
  const { navigate } = useAppState();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    await deleteCommittee(id);
    toggleDialog();
    navigate('committees');
  };

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleMenu = () => setMenuOpen((prevState) => !prevState);

  return (
    <>
      <div
        className="fixed bottom-5 right-5 z-100 hover:dark:bg-[#42a5f5] hover:bg-[#1565c0] hover:shadow-2xl shadow-xl duration-300 dark:bg-[#90caf9] bg-[#1976d2] text-white rounded-3xl py-1 px-3 dark:text-black">
        <Button color="inherit" onClick={handleSave}>
          <SaveIcon className="mr-2" />
          {id ? text('Update Committee', 'Committee bijwerken') : text('Save Committee', 'Commissie opslaan')}
        </Button>
        {id && <>
          <Tooltip
            title={
              menuOpen
                ? text('Fewer Options', 'Minder opties')
                : text('More Options', 'Meer opties')
            }
            placement="top"
          >
            <IconButton color="inherit" onClick={toggleMenu}>
              {menuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
          <Collapse in={menuOpen} timeout="auto" unmountOnExit>
            <div className="grid">
              <div className="flex justify-self-start">
                <Button color="inherit" onClick={toggleDialog}>
                  <DeleteIcon className="mr-2" />
                  {text('Delete Committee', 'Commissie verwijderen')}
                </Button>
              </div>
            </div>
          </Collapse>
        </>}
      </div>
      <AreYouSure
        open={dialogOpen}
        onCancel={toggleDialog}
        onConfirm={handleDelete}
        message={text(
          'You are about to delete this committee.',
          'Je staat op het punt dit commissie te verwijderen.'
        )}
      />
    </>
  );
}
