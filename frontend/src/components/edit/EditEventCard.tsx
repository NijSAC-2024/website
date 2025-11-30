import {Button} from '@mui/material';
import { EventContent, typesOptions} from '../../types.ts';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {ChangeEvent, useState} from 'react';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {isAdminOrBoard} from '../../util.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useLocations} from '../../hooks/useLocations.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';
import {Control, UseFormGetValues, UseFormRegister, UseFormSetValue} from 'react-hook-form';
import {EditEventForm} from './EditEvent.tsx';
import {FormInputSelect} from '../form/FormInputSelect.tsx';
import FormInputOptionSelector from '../form/FormInputOptionSelector.tsx';
import {FormInputText} from '../form/FormInputText.tsx';

interface EditAgendaCardProps {
  control: Control<EditEventForm>,
  register: UseFormRegister<EditEventForm>,
  setValue: UseFormSetValue<EventContent>;
  getValues: UseFormGetValues<EventContent>;
}

export default function EditEventCard({
  control,
  register,
  setValue,
  getValues
}: EditAgendaCardProps) {
  const {text} = useLanguage();
  const {user} = useUsers();
  const {locations} = useLocations();
  const {committees, myCommittees} = useCommittees();
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append(file.name, file);
      const response = await fetch('/api/file', {
        method: 'POST',
        body: formData
      });
      const uploadInfo = await response.json();
      setValue('image', uploadInfo[0].id);
      setUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  const image = getValues('image');

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
            <FormInputSelect
              {...register('eventType')}
              control={control}
              label={text('Category*', 'Categorie*')}
              options={[
                {value: 'activity', label: text('Activity', 'Activiteit')},
                {value: 'course', label: text('Course', 'Cursus')},
                {value: 'training', label: text('Training', 'Training')},
                {value: 'weekend', label: text('Weekend', 'Weekend')},

              ]}
            />
            <FormInputSelect
              {...register('createdBy')}
              control={control}
              label={text('Committee*', 'Commissie*')}
              options={committees.filter(c => (myCommittees.some(uc => uc.committeeId == c.id && uc.left == null) || isAdminOrBoard(user))).map(committee => {
                return {value: committee.id, label: text(committee.name)};
              })}
            />
            <FormInputOptionSelector
              {...register('metadata.type')}
              control={control}
              label="Type"
              options={typesOptions.map(({id, label}) => {return {value: id, label: text(label)}})}
            />
          </div>
          {/* Title */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <FormInputText
              {...register('name.en', {
                required: text('An English name is required', 'Een Engelse naam is vereist'),
                minLength: {value: 3, message: text('Name must be at least 3 characters', 'De naam moet minimaal 3 tekens bevatten')}
              })}
              label={text('Title English*', 'Titel Engels*')}
              control={control}
              size='medium'
            />
            <FormInputText
              {...register('name.nl', {
                required: text('A Dutch name is required', 'Een Nederlandse naam is vereist'),
                minLength: {value: 3, message: text('Name must be at least 3 characters', 'De naam moet minimaal 3 tekens bevatten')}
              })}
              label={text('Title Dutch*', 'Titel Nederlands*')}
              control={control}
              size='medium'
            />
          </div>
          {/*Location*/}
          <FormInputSelect
            {...register('location')}
            control={control}
            label={text('Location*', 'Locatie*')}
            options={locations.map(l => {return {value: l.id, label: text(l.name)}})}
          />
          {/*<FormControl fullWidth>*/}
          {/*  <InputLabel id="select-label">*/}
          {/*    {text('Location*', 'Locatie*')}*/}
          {/*  </InputLabel>*/}
          {/*  <Select*/}
          {/*    required*/}
          {/*    labelId="select-label"*/}
          {/*    value={location}*/}
          {/*    label={text('Location*', 'Locatie*')}*/}
          {/*    onChange={(e) =>*/}
          {/*      handleEventChange({location: e.target.value})*/}
          {/*    }*/}
          {/*    variant="outlined"*/}
          {/*  >*/}
          {/*    {locations?.map((l) => (*/}
          {/*      <MenuItem key={l.id} value={l.id}>*/}
          {/*        {text(l.name)}*/}
          {/*      </MenuItem>*/}
          {/*    ))}*/}
          {/*  </Select>*/}
          {/*</FormControl>*/}
          {/*Dates*/}
          {/*<EditDates*/}
          {/*  dates={dates}*/}
          {/*  handleEventChange={handleEventChange}*/}
          {/*/>*/}
        </div>
      </div>
    </div>
  );
};
