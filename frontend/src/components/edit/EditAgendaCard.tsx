import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { text } from '../../util.ts';
import { Activity, ActivityType, DateType, Language, typesOptions, WeekendType } from '../../types.ts';
import OptionSelector from '../OptionSelector.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ChangeEvent } from 'react';
import EditDates from './EditDates.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useApiState } from '../../providers/ApiProvider.tsx';

interface EditAgendaCardProps {
  category: ActivityType;
  image?: string;
  type: WeekendType[];
  name: Language;
  dates: DateType[];
  location: string;
  handleFieldChange: (
    name: keyof Activity,
    value: Language | string | WeekendType[]
  ) => void;
  handleDateChange: (index: number, startDate: boolean, value: string) => void;
  handleAddDate: () => void;
  handleRemoveDate: (index: number) => void;
}

export default function EditAgendaCard({
  category,
  image = 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png',
  type,
  name,
  dates,
  location,
  handleFieldChange,
  handleDateChange,
  handleAddDate,
  handleRemoveDate
}: EditAgendaCardProps) {
  const { language: lang } = useLanguage();
  const { locations } = useApiState();
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
    <div
      className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col">
      <div>
        <img className="w-full aspect-4/2 object-cover" src={image} alt="Event" />
      </div>
      <div className="p-5">
        <div className="grid gap-5">
          {/* Image */}
          <Button
            component="label"
            variant="contained"
            color="primary"
            aria-label={text(lang, 'Change Image', 'Afbeelding Wijzigen')}
            className="mx-auto"
          >
            <PhotoCameraIcon className="mr-2" />
            {text(lang, 'Upload Image', 'Afbeelding Uploaden')}
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </Button>

          {/* Category and Type */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <FormControl fullWidth>
              <InputLabel id="select-label">{text(lang, 'Category*', 'Categorie*')}</InputLabel>
              <Select
                labelId="select-label"
                value={category}
                label={text(lang, 'Category*', 'Categorie*')}
                variant="outlined"
                onChange={(e) => handleFieldChange('activityType', e.target.value)}
              >
                <MenuItem value="activity">{text(lang, 'Activity', 'Activiteit')}</MenuItem>
                <MenuItem value="course">{text(lang, 'Course', 'Cursus')}</MenuItem>
                <MenuItem value="training">{text(lang, 'Training', 'Training')}</MenuItem>
                <MenuItem value="weekend">{text(lang, 'Weekend', 'Weekend')}</MenuItem>
              </Select>
            </FormControl>
            <OptionSelector
              options={typesOptions}
              selected={type}
              onChange={(selectedTypes) => handleFieldChange('type', selectedTypes)}
              label={'Type'}
            />
          </div>

          {/* Title */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <TextField
              value={name.en}
              label={text(lang, 'Title English*', 'Titel Engels*')}
              onChange={(e) => handleFieldChange('name', { ...name, en: e.target.value })}
            />
            <TextField
              value={name.nl}
              label={text(lang, 'Title Dutch*', 'Titel Nederlands*')}
              onChange={(e) => handleFieldChange('name', { ...name, nl: e.target.value })}
            />
          </div>

          {/*Location*/}
          <Select
            value={location}
            label={text(lang, 'Location*', 'Locatie*')}
            onChange={(e) => handleFieldChange('location', e.target.value)}
          >
            {locations?.map(l =>
              <MenuItem value={l.id}>{text(lang, l.name)}</MenuItem>
            )}
          </Select>

          {/*Dates*/}
          <EditDates
            dates={dates}
            handleAddDate={handleAddDate}
            handleDateChange={handleDateChange}
            handleRemoveDate={handleRemoveDate}
          />
        </div>
      </div>
    </div>
  );
}
