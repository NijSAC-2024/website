import { Button, Collapse, Fab, IconButton, Tooltip } from '@mui/material';
import moment from 'moment/moment';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../../util.ts';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { ActivityType, Language } from '../../types.ts';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from '../AreYouSure.tsx';

interface SaveButtonProps {
  title: Language;
  location: string;
  category: ActivityType;
  startDateTime: string;
  endDateTime: string;
  handleSave: (isPublished: boolean) => void;
}

export default function SaveButton({
  title,
  location,
  category,
  startDateTime,
  endDateTime,
  handleSave
}: SaveButtonProps) {
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
      <div className="fixed bottom-5 right-5 z-10">
        <Fab variant="extended" color="primary">
          <Button
            color="inherit"
            onClick={() => handleSave(true)}
            disabled={
              !title.en ||
              !title.nl ||
              !location ||
              !category ||
              moment(endDateTime).isBefore(moment(startDateTime))
            }
          >
            <SaveIcon className="mr-2" />
            {text('Save Event', 'Evenement opslaan')}
          </Button>
          <Tooltip title={isDraft ? null : text('More Options', 'Meer opties')}>
            <IconButton color="inherit" onClick={toggleIsDraft}>
              {isDraft ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
          <Collapse in={isDraft} timeout="auto" unmountOnExit>
            <Button color="inherit" onClick={() => handleSave(false)}>
              <SaveAsIcon className="mr-2" />
              {text('Save As Draft', 'Opslaan als concept')}
            </Button>
            <Button color="inherit" onClick={toggleOpen}>
              <DeleteIcon className="mr-2" />
              {text('Delete Event', 'Evenement verwijderen')}
            </Button>
          </Collapse>
        </Fab>
      </div>
      <AreYouSure
        open={open}
        onCancel={toggleOpen}
        onConfirm={handleDelete}
        message={text(
          'You are about to delete this event.',
          'Je staat op het punt dit evenement te verwijderen.'
        )}
      />
    </>
  );
}
