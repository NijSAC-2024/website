import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { text } from '../util.ts';
import { DateTimePicker } from '@mui/x-date-pickers-pro';
import moment from 'moment/moment';
import { AgendaEventType } from '../types.ts';
import { Moment } from 'moment';

interface EditAgendaCardProps {
  updatedAgendaEvent: AgendaEventType;
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof AgendaEventType, value: string | Moment | boolean) => void;
}
export default function EditAgendaCard({
  updatedAgendaEvent,
  handleFieldChange
}: EditAgendaCardProps) {
  return (
    <div className="w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col relative">
      <img
        className="w-full aspect-[4/2] object-cover"
        src={updatedAgendaEvent.image}
        alt="Event"
      />
      <div className="p-5">
        <div className="grid space-y-5">
          <div className="grid space-y-3">
            <TextField
              value={updatedAgendaEvent.titleEN}
              label={text('English Title', 'Engelse Titel')}
              onChange={(e) => handleFieldChange('titleEN', e.target.value)}
            />
            <TextField
              value={updatedAgendaEvent.titleNL}
              label={text('Dutch Title', 'Nederlandse Titel')}
              onChange={(e) => handleFieldChange('titleNL', e.target.value)}
            />
          </div>
          <FormControl fullWidth>
            <InputLabel id="select-label">{text('Category', 'Categorie')}</InputLabel>
            <Select
              labelId="select-label"
              value={updatedAgendaEvent.category}
              label={text('Category', 'Categorie')}
              variant="outlined"
              onChange={(e) => handleFieldChange('category', e.target.value)}
            >
              <MenuItem value="activity">{text('Activities', 'Activiteiten')}</MenuItem>
              <MenuItem value="course">{text('Courses', 'Cursussen')}</MenuItem>
              <MenuItem value="training">{text('Trainings', 'Trainingen')}</MenuItem>
              <MenuItem value="weekend">{text('Weekends', 'Weekenden')}</MenuItem>
            </Select>
          </FormControl>
          <div className="grid space-y-3">
            <TextField
              value={updatedAgendaEvent.locationEN}
              label={text('Location English', 'Locatie Engels')}
              onChange={(e) => handleFieldChange('locationEN', e.target.value)}
            />
            <TextField
              value={updatedAgendaEvent.locationNL}
              label={text('Location Dutch', 'Locatie Nederlands')}
              onChange={(e) => handleFieldChange('locationNL', e.target.value)}
            />
          </div>
          <div className="grid space-y-3">
            <DateTimePicker
              label={text('Start Date', 'Start Datum')}
              value={moment(updatedAgendaEvent.startDateTime)}
              onChange={(date) => handleFieldChange('startDateTime', date!)}
            />
            <DateTimePicker
              label={text('End Date', 'Eind Datum')}
              value={moment(updatedAgendaEvent.endDateTime)}
              onChange={(date) => handleFieldChange('endDateTime', date!)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
