import { Button, Collapse, Fab, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../../util.ts';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { ActivityType, Language } from '../../types.ts';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from '../AreYouSure.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface SaveButtonProps {
  name: Language;
  location: string;
  category: ActivityType;
  handleSave: (isPublished: boolean) => void;
}

export default function SaveButton({ name, location, category, handleSave }: SaveButtonProps) {
  const { language: lang } = useLanguage();
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleDelete = () => {
    console.log('Delete Event');
    toggleOpen();
  };

  const toggleOpen = () => setOpen((prev) => !prev);

  const toggleIsDraft = () => setIsDraft((prevState) => !prevState);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-10 dark:bg-[#90caf9] rounded-3xl py-1 px-3 dark:text-black">
        <Button color="inherit" onClick={() => handleSave(true)}>
          <SaveIcon className="mr-2" />
          {text(lang, 'Save Event', 'Evenement opslaan')}
        </Button>
        <Tooltip title={isDraft ? null : text(lang, 'More Options', 'Meer opties')}>
          <IconButton color="inherit" onClick={toggleIsDraft}>
            {isDraft ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
        <Collapse in={isDraft} timeout="auto" unmountOnExit>
          <div className="grid">
            <div className="flex justify-self-start">
              <Button color="inherit" onClick={() => handleSave(false)}>
                <SaveAsIcon className="mr-2" />
                {text(lang, 'Save As Draft', 'Opslaan als concept')}
              </Button>
            </div>
            <div className="flex justify-self-start">
              <Button color="inherit" onClick={toggleOpen}>
                <DeleteIcon className="mr-2" />
                {text(lang, 'Delete Event', 'Evenement verwijderen')}
              </Button>
            </div>
          </div>
        </Collapse>
      </div>
      <AreYouSure
        open={open}
        onCancel={toggleOpen}
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
