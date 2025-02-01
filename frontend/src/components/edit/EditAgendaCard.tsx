import { FormControl, InputLabel, MenuItem, Select, TextField, Button, Fab } from '@mui/material';
import { text } from '../../util.ts';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';
import {
  EventType,
  OptionType,
  LanguageType,
  typesOptions,
  CategoryType,
  DateType
} from '../../types.ts';
import OptionSelector from '../OptionSelector.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ChangeEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';

interface EditAgendaCardProps {
  category: CategoryType;
  image: string;
  type: OptionType[];
  title: LanguageType;
  dates: DateType[];
  location: string;
  handleFieldChange: (
    // eslint-disable-next-line no-unused-vars
    name: keyof EventType,
    // eslint-disable-next-line no-unused-vars
    value: LanguageType | string | OptionType[]
  ) => void;
  // eslint-disable-next-line no-unused-vars
  handleDateChange: (index: number, startDate: boolean, value: string) => void;
  handleAddDate: () => void;
  // eslint-disable-next-line no-unused-vars
  handleRemoveDate: (index: number) => void;
}

export default function EditAgendaCard({
  category,
  image,
  type,
  title,
  dates,
  location,
  handleFieldChange,
  handleDateChange,
  handleAddDate,
  handleRemoveDate
}: EditAgendaCardProps) {
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
        <img className="w-full aspect-4/2 object-cover" src={image} alt="Event" />
      </div>
      <div className="p-5">
        <div className="grid gap-5">
          <Button
            component="label"
            variant="contained"
            color="primary"
            aria-label={text('Change Image', 'Afbeelding Wijzigen')}
            className="mx-auto">
            <PhotoCameraIcon className="mr-2" />
            {text('Upload Image', 'Afbeelding Uploaden')}
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </Button>

          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <FormControl fullWidth>
              <InputLabel id="select-label">{text('Category*', 'Categorie*')}</InputLabel>
              <Select
                labelId="select-label"
                value={category}
                label={text('Category*', 'Categorie*')}
                variant="outlined"
                onChange={(e) => handleFieldChange('category', e.target.value)}>
                <MenuItem value="activity">{text('Activity', 'Activiteit')}</MenuItem>
                <MenuItem value="course">{text('Course', 'Cursus')}</MenuItem>
                <MenuItem value="training">{text('Training', 'Training')}</MenuItem>
                <MenuItem value="weekend">{text('Weekend', 'Weekend')}</MenuItem>
              </Select>
            </FormControl>
            <OptionSelector
              options={typesOptions}
              onChange={(selectedTypes) => handleFieldChange('type', selectedTypes)}
              label={'Type'}
              initialOptions={type}
            />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <TextField
              value={title.en}
              label={text('Title English*', 'Titel Engels*')}
              onChange={(e) => handleFieldChange('title', { ...title, en: e.target.value })}
            />
            <TextField
              value={title.nl}
              label={text('Title Dutch*', 'Titel Nederlands*')}
              onChange={(e) => handleFieldChange('title', { ...title, nl: e.target.value })}
            />
          </div>
          <TextField
            value={location}
            label={text('Location*', 'Locatie*')}
            onChange={(e) => handleFieldChange('location', e.target.value)}
          />
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <DateTimePicker
              label={text('Start Date*', 'Startdatum*')}
              value={moment(dates[0].startDateTime)}
              onChange={(date) => handleFieldChange('dates', date!.toISOString())}
            />
            <DateTimePicker
              label={text('End Date*', 'Einddatum*')}
              value={moment(dates[0].endDateTime)}
              onChange={(date) => handleFieldChange('dates', date!.toISOString())}
            />
          </div>
          <div className="flex justify-center">
            <Fab size="small" color="primary" onClick={() => handleAddDate()}>
              <AddIcon />
            </Fab>
          </div>
        </div>
      </div>
    </div>
  );
}
