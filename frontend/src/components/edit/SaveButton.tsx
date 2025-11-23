import { Button, Collapse, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from '../AreYouSure.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {EventContent} from '../../types.ts';
import moment from 'moment';
import {useWebsite} from '../../hooks/useState.ts';
import {useEvents} from '../../hooks/useEvents.ts';

interface SaveButtonProps {
  id: string;
  handleSave: (isPublished: boolean) => void;
  event: EventContent;
}

export default function SaveButton({ id, handleSave, event }: SaveButtonProps) {
  const { text } = useLanguage();
  const {navigate} = useWebsite();
  const {deleteEvent} = useEvents();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    await deleteEvent(id);
    toggleDialog();
    navigate('events');
  };

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleMenu = () => setMenuOpen((prevState) => !prevState);

  return (
    <>
      <div
        className="fixed bottom-5 right-5 z-100 hover:dark:bg-[#42a5f5] hover:bg-[#1565c0] hover:shadow-2xl shadow-xl duration-300 dark:bg-[#90caf9] bg-[#1976d2] text-white rounded-3xl py-1 px-3 dark:text-black">
        <Button color="inherit" disabled={!event.location || !event.name.nl || ! event.name.en || !event.eventType || moment(event.dates[0].end).isBefore(moment(event.dates[0].start)) || (!!event.registrationPeriod && moment(event.registrationPeriod.end).isBefore(moment(event.registrationPeriod.start)))} onClick={() => handleSave(true)}>
          <SaveIcon className="mr-2" />
          {id ? text('Update Event', 'Evenement bijwerken') : text('Publish Event', 'Evenement publiceren')}
        </Button>
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
              <Button color="inherit" onClick={() => handleSave(false)}>
                <SaveAsIcon className="mr-2" />
                {text('Save As Draft', 'Opslaan als concept')}
              </Button>
            </div>
            {id && <div className="flex justify-self-start">
              <Button color="inherit" onClick={toggleDialog}>
                <DeleteIcon className="mr-2" />
                {text('Delete Event', 'Evenement verwijderen')}
              </Button>
            </div>}
          </div>
        </Collapse>
      </div>
      <AreYouSure
        open={dialogOpen}
        onCancel={toggleDialog}
        onConfirm={handleDelete}
        message={text(
          'You are about to delete this event.',
          'Je staat op het punt dit evenement te verwijderen.'
        )}
      />
    </>
  );
}
