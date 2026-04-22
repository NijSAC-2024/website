import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {EventContent, EventType, typesOptions, WeekendType} from '../../types.ts';
import OptionSelector from '../OptionSelector.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {ChangeEvent, memo, useState} from 'react';
import EditDates from './EditDates.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useCommitteeHook} from '../../hooks/useCommitteeHook.ts';
import EditLocation from './EditLocation.tsx';

function EditEventCard() {
  const {text} = useLanguage();
  const {useAuthUser, useUserCommittees} = useUserHook();
  const {useCommittees} = useCommitteeHook();
  const {control, setValue} = useFormContext<EventContent>();
  const [uploading, setUploading] = useState(false);
  const [image, metadata, location] = useWatch({
    control,
    name: ['image', 'metadata', 'location']
  });

  const user = useAuthUser();
  const committees = useCommittees()
  const myCommittees = useUserCommittees(user?.id)

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
        setValue('image', uploadInfo[0].id, {shouldDirty: true});
        setUploading(false);
      });
    }
  };

  return (
    <div
      className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col">
      <img
        className="w-full aspect-4/2 object-cover"
        src={image?.startsWith('https://') ? image : `/api/file/${image}`}
        alt="Event"
      />
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
              startIcon={<PhotoCameraIcon/>}
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
          {/* Category, Committee and Type */}
          <div className="grid gap-3">
            <FormControl fullWidth required>
              <InputLabel id="select-label">
                {text('Category', 'Categorie')}
              </InputLabel>
              <Controller
                name="eventType"
                control={control}
                render={({field}) => (
                  <Select
                    labelId="select-label"
                    value={field.value}
                    label={text('Category*', 'Categorie*')}
                    variant="outlined"
                    onChange={(e) => field.onChange(e.target.value as EventType)}
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
                )}
              />
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="committee-select-label">
                {text('Committee', 'Commissie')}
              </InputLabel>
              <Controller
                name="createdBy"
                control={control}
                render={({field}) => (
                  <Select
                    labelId="committee-select-label"
                    value={field.value}
                    label={text('Committee*', 'Commissie*')}
                    variant="outlined"
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {committees?.filter(c => (myCommittees?.some(uc => uc.committeeId == c.id && uc.left == null) || user && isAdminOrBoard(user.roles))).map((committee) => (
                      <MenuItem key={committee.id} value={committee.id}>
                        {text(committee.name)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <OptionSelector
              options={typesOptions}
              selected={metadata?.type}
              onChange={(selectedTypes) =>
                setValue('metadata', {
                  ...metadata,
                  type: selectedTypes as WeekendType[]
                }, {shouldDirty: true})
              }
              label={'Type'}
            />
          </div>
          {/* Title */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <Controller
              name="name.en"
              control={control}
              render={({field}) => (
                <TextField
                  required
                  value={field.value}
                  label={text('Title English', 'Titel Engels')}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="name.nl"
              control={control}
              render={({field}) => (
                <TextField
                  required
                  value={field.value}
                  label={text('Title Dutch', 'Titel Nederlands')}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          {/*Location*/}
          <EditLocation
            value={location}
            onChange={(nextLocation) => setValue('location', nextLocation, {shouldDirty: true})}
          />
          {/*Dates*/}
          <EditDates/>
        </div>
      </div>
    </div>
  );
}

export default memo(EditEventCard);
