import { Button, Collapse, IconButton } from '@mui/material';
import moment from 'moment/moment';
import SaveIcon from '@mui/icons-material/Save';
import { text } from '../../util.ts';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { CategoryType, LanguageType } from '../../types.ts';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface SaveButtonProps {
  title: LanguageType;
  location: string;
  category: CategoryType;
  startDateTime: string;
  endDateTime: string;
  // eslint-disable-next-line no-unused-vars
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

  const toggleIsDraft = () => setIsDraft((prevState) => !prevState);

  return (
    <div className="fixed bottom-5 right-5 z-10">
      <div className="bg-[#1976d2] dark:bg-[#90caf9] rounded-3xl p-1 text-white dark:text-black shadow-2xl hover:dark:bg-[#42a5f5] duration-300">
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
        <IconButton color="inherit" onClick={toggleIsDraft}>
          {isDraft ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Collapse in={isDraft} timeout="auto" unmountOnExit>
          <Button color="inherit" onClick={() => handleSave(false)}>
            <SaveAsIcon className="mr-2" />
            {text('Save As Draft', 'Opslaan als concept')}
          </Button>
        </Collapse>
      </div>
    </div>
  );
}
