import { FormControl, InputLabel, MenuItem, Select, TextField, Fab } from '@mui/material';
import { text } from '../util.ts';
import { DateTimePicker } from '@mui/x-date-pickers-pro';
import moment from 'moment/moment';
import { AgendaEventType, OptionsType, OptionType, LanguageType, typesOptions } from '../types.ts';
import OptionSelector from './OptionSelector.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ChangeEvent } from 'react';

interface EditAgendaCardProps {
  updatedAgendaEvent: AgendaEventType;
  handleFieldChange: (
    // eslint-disable-next-line no-unused-vars
    name: keyof AgendaEventType,
    // eslint-disable-next-line no-unused-vars
    value: LanguageType | string | OptionType[]
  ) => void;
}

export default function EditAgendaCard({
  updatedAgendaEvent,
  handleFieldChange
}: EditAgendaCardProps) {
  const getAllowedTypes = (): OptionsType[] => {
    switch (updatedAgendaEvent.category) {
      case 'course':
        return typesOptions.filter((type) => type.id !== 'education' && type.id !== 'boulder');
      case 'training':
        return typesOptions.filter((type) => type.id !== 'education');
      default:
        return typesOptions;
    }
  };

  const allowedTypes = getAllowedTypes();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          handleFieldChange('image', reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col">
      <div>
        <img
          className="w-full aspect-[4/2] object-cover"
          src={updatedAgendaEvent.image}
          alt="Event"
        />
      </div>
      <div className="p-5">
        <div className="grid space-y-5">
          <Fab
            component="label"
            variant="extended"
            color="primary"
            aria-label={text('Change Image', 'Afbeelding Wijzigen')}
            className="mx-auto"
          >
            <PhotoCameraIcon className="mr-2" />
            {text('Upload Image', 'Afbeelding Uploaden')}
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </Fab>
          <div className="grid space-y-3">
            <TextField
              value={updatedAgendaEvent.title.en}
              label={text('Title English', 'Titel Engels')}
              onChange={(e) =>
                handleFieldChange('title', { ...updatedAgendaEvent.title, en: e.target.value })
              }
            />
            <TextField
              value={updatedAgendaEvent.title.nl}
              label={text('Title Dutch', 'Titel Nederlands')}
              onChange={(e) =>
                handleFieldChange('title', { ...updatedAgendaEvent.title, nl: e.target.value })
              }
            />
          </div>
          <div className="grid space-y-3">
            <FormControl fullWidth>
              <InputLabel id="select-label">{text('Category', 'Categorie')}</InputLabel>
              <Select
                labelId="select-label"
                value={updatedAgendaEvent.category}
                label={text('Category', 'Categorie')}
                variant="outlined"
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                <MenuItem value="activity">{text('Activity', 'Activiteit')}</MenuItem>
                <MenuItem value="course">{text('Course', 'Cursus')}</MenuItem>
                <MenuItem value="training">{text('Training', 'Training')}</MenuItem>
                <MenuItem value="weekend">{text('Weekend', 'Weekend')}</MenuItem>
              </Select>
            </FormControl>
            <OptionSelector
              options={allowedTypes}
              onChange={(selectedTypes) => handleFieldChange('type', selectedTypes)}
              label={'Type'}
              initialOptions={updatedAgendaEvent.type}
            />
          </div>
          <div className="grid space-y-3">
            <TextField
              value={updatedAgendaEvent.location}
              label={text('Location', 'Locatie')}
              onChange={(e) => handleFieldChange('location', e.target.value)}
            />
          </div>
          <div className="grid space-y-3">
            <DateTimePicker
              label={text('Start Date', 'Start Datum')}
              value={moment(updatedAgendaEvent.startDateTime)}
              onChange={(date) => handleFieldChange('startDateTime', date!.toISOString())}
            />
            <DateTimePicker
              label={text('End Date', 'Eind Datum')}
              value={moment(updatedAgendaEvent.endDateTime)}
              onChange={(date) => handleFieldChange('endDateTime', date!.toISOString())}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
