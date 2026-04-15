import { Button, Collapse, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from '../AreYouSure.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import moment from 'moment';
import {useEvents} from '../../hooks/useEvents.ts';
import {EventContent} from '../../types.ts';
import {useFormContext, useWatch} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';

interface SaveButtonProps {
  id: string;
  handleSave: (event: EventContent, isPublished: boolean) => void;
}

export default function SaveButton({ id, handleSave }: SaveButtonProps) {
  const { text } = useLanguage();
  const {deleteEvent} = useEvents();
  const {handleSubmit, control} = useFormContext<EventContent>();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [location, name, eventType, dates, registrationPeriod] = useWatch({
    control,
    name: ['location', 'name', 'eventType', 'dates', 'registrationPeriod']
  });
  const navigate = useNavigate();

  const publishDisabled =
    !location ||
    !name?.nl ||
    !name?.en ||
    !eventType ||
    !dates?.[0] ||
    moment(dates[0].end).isBefore(moment(dates[0].start)) ||
    (!!registrationPeriod && moment(registrationPeriod.end).isBefore(moment(registrationPeriod.start)));

  const handleDelete = async () => {
    await deleteEvent(id);
    toggleDialog();
    navigate('/events');
  };

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  const toggleMenu = () => setMenuOpen((prevState) => !prevState);

  return (
    <>
      <div
        className="fixed bottom-5 right-5 z-100 hover:dark:bg-[#42a5f5] hover:bg-[#1565c0] hover:shadow-2xl shadow-xl duration-300 dark:bg-[#90caf9] bg-[#1976d2] text-white rounded-3xl py-1 px-3 dark:text-black">
        <Button color="inherit" disabled={publishDisabled} onClick={handleSubmit((event) => handleSave(event, true))}>
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
              <Button color="inherit" onClick={handleSubmit((event) => handleSave(event, false))}>
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
