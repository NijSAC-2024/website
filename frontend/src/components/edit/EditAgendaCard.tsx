import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DateType, EventContent, EventType, Language, Metadata, typesOptions, WeekendType } from '../../types.ts';
import OptionSelector from '../OptionSelector.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { ChangeEvent, useState } from 'react';
import EditDates from './EditDates.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useApiState } from '../../providers/ApiProvider.tsx';

interface EditAgendaCardProps {
  category: EventType;
  image?: string;
  metadata?: Metadata;
  name: Language;
  dates: DateType[];
  location: string;
  handleEventChange: (changes: Partial<EventContent>) => void;
}

export default function EditAgendaCard({
  category,
  image = 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png',
  metadata,
  name,
  dates,
  location,
  handleEventChange
}: EditAgendaCardProps) {
  const { text } = useLanguage();
  const { locations } = useApiState();
  const [uploading, setUploading] = useState(false);
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append(file.name, file);
      fetch('/api/file', {
        method: 'POST',
        body: formData
      }).then((response) => response.json()).then((uploadInfo) => {
        handleEventChange({ image: uploadInfo[0].id });
        setUploading(false);
      });
    }
  };

  return (
    <div
      className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col">
      <div>
        <img
          className="w-full aspect-4/2 object-cover"
          src={image?.startsWith('https://') ? image : `/api/file/${image}`}
          alt="Event"
        />
      </div>
      <div className="p-5">
        <div className="grid gap-5">
          {/* Image */}
          <form encType="multipart/form-data" action="/file" method="post">
            <Button
              fullWidth
              component="label"
              variant="contained"
              loading={uploading}
              color="primary"
              aria-label={text('Change Image', 'Afbeelding Wijzigen')}
              className="mx-auto"
              startIcon={<PhotoCameraIcon />}
            >
              {text('Upload Image', 'Afbeelding Uploaden')}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
          </form>
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
                onChange={(e) => {
                  handleEventChange({ eventType: e.target.value as EventType });
                }}
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
                handleEventChange({
                  metadata: {
                    ...metadata,
                    type: selectedTypes as WeekendType[]
                  }
                })
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
                handleEventChange({
                  name: {
                    ...name,
                    en: e.target.value
                  }
                })
              }
            />
            <TextField
              value={name.nl}
              label={text('Title Dutch*', 'Titel Nederlands*')}
              onChange={(e) =>
                handleEventChange({
                  name: {
                    ...name,
                    nl: e.target.value
                  }
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
              required
              labelId="select-label"
              value={location}
              label={text('Location*', 'Locatie*')}
              onChange={(e) =>
                handleEventChange({ location: e.target.value })
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
            handleEventChange={handleEventChange}
          />
        </div>
      </div>
    </div>
  );
}
