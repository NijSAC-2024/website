import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DateType, EventContent, EventType, Language, Metadata, typesOptions } from '../../types.ts';
import OptionSelector from '../OptionSelector.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ChangeEvent } from 'react';
import EditDates from './EditDates.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useApiState } from '../../providers/ApiProvider.tsx';

interface EditAgendaCardProps {
  category: EventType;
  image?: string;
  metadata: Metadata;
  name: Language;
  dates: DateType[];
  location: string;
  handleFieldChange: (
    name: keyof EventContent,
    value: Metadata | EventType | Language | string
  ) => void;
  handleDateChange: (index: number, startDate: boolean, value: string) => void;
  handleAddDate: () => void;
  handleRemoveDate: (index: number) => void;
}

export default function EditAgendaCard({
  category,
  image = 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png',
  metadata,
  name,
  dates,
  location,
  handleFieldChange,
  handleDateChange,
  handleAddDate,
  handleRemoveDate
}: EditAgendaCardProps) {
  const { text } = useLanguage();
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
        <img
          className="w-full aspect-4/2 object-cover"
          src={image}
          alt="Event"
        />
      </div>
      <div className="p-5">
        <div className="grid gap-5">
          {/* Image */}
          <Button
            component="label"
            variant="contained"
            color="primary"
            aria-label={text('Change Image', 'Afbeelding Wijzigen')}
            className="mx-auto"
          >
            <PhotoCameraIcon className="mr-2" />
            {text('Upload Image', 'Afbeelding Uploaden')}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>
          {/* Category and Type */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <FormControl fullWidth>
              <InputLabel id="select-label">
                {text('Category*', 'Categorie*')}
              </InputLabel>
              <Select
                labelId="select-label"
                value={category}
                label={text('Category*', 'Categorie*')}
                variant="outlined"
                onChange={(e) =>
                  handleFieldChange('eventType', e.target.value as EventType)
                }
              >
                <MenuItem value="activity">
                  {text('Activity', 'Activiteit')}
                </MenuItem>
                <MenuItem value="course">
                  {text('Course', 'Cursus')}
                </MenuItem>
                <MenuItem value="training">
                  {text('Training', 'Training')}
                </MenuItem>
                <MenuItem value="weekend">
                  {text('Weekend', 'Weekend')}
                </MenuItem>
              </Select>
            </FormControl>
            <OptionSelector
              options={typesOptions}
              selected={metadata?.type}
              onChange={(selectedTypes) =>
                handleFieldChange('metadata', {
                  ...metadata,
                  type: selectedTypes
                } as Metadata)
              }
              label={'Type'}
            />
          </div>
          {/* Title */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <TextField
              value={name.en}
              label={text('Title English*', 'Titel Engels*')}
              onChange={(e) =>
                handleFieldChange('name', {
                  ...name,
                  en: e.target.value
                })
              }
            />
            <TextField
              value={name.nl}
              label={text('Title Dutch*', 'Titel Nederlands*')}
              onChange={(e) =>
                handleFieldChange('name', {
                  ...name,
                  nl: e.target.value
                })
              }
            />
          </div>
          {/*Location*/}
          <FormControl fullWidth>
            <InputLabel id="select-label">
              {text('Location*', 'Locatie*')}
            </InputLabel>
            <Select
              labelId="select-label"
              value={location}
              label={text('Location*', 'Locatie*')}
              onChange={(e) =>
                handleFieldChange('location', e.target.value as string)
              }
              variant="outlined"
            >
              {locations?.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {text(l.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
