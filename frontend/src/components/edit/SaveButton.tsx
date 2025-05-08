import { Button, Collapse, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../../util.ts';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from '../AreYouSure.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface SaveButtonProps {
  handleSave: (isPublished: boolean) => void;
}

export default function SaveButton({ handleSave }: SaveButtonProps) {
  const { language: lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleDelete = () => {
    console.log('Delete Event');
    toggleDialog();
  };

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleMenu = () => setMenuOpen((prevState) => !prevState);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-10 hover:dark:bg-[#42a5f5] hover:bg-[#1565c0] hover:shadow-2xl shadow-xl duration-300 dark:bg-[#90caf9] bg-[#1976d2] text-white rounded-3xl py-1 px-3 dark:text-black">
        <Button color="inherit" onClick={() => handleSave(true)}>
          <SaveIcon className="mr-2" />
          {text(lang, 'Save Event', 'Evenement opslaan')}
        </Button>
        <Tooltip
          title={
            menuOpen
              ? text(lang, 'Less Options', 'Minder opties')
              : text(lang, 'More Options', 'Meer opties')
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
              <Button color="inherit" onClick={() => handleSave(false)}>
                <SaveAsIcon className="mr-2" />
                {text(lang, 'Save As Draft', 'Opslaan als concept')}
              </Button>
            </div>
            <div className="flex justify-self-start">
              <Button color="inherit" onClick={toggleDialog}>
                <DeleteIcon className="mr-2" />
                {text(lang, 'Delete Event', 'Evenement verwijderen')}
              </Button>
            </div>
          </div>
        </Collapse>
      </div>
      <AreYouSure
        open={dialogOpen}
        onCancel={toggleDialog}
        onConfirm={handleDelete}
        message={text(
          lang,
          'You are about to delete this event.',
          'Je staat op het punt dit evenement te verwijderen.'
        )}
      />
      ;
    </>
  );
}
