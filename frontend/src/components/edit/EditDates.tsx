import { DateTimePicker } from '@mui/x-date-pickers';
import { text } from '../../util.ts';
import moment from 'moment';
import { Fab, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DateType } from '../../types.ts';

interface EditDatesProps {
  dates: DateType[];
  // eslint-disable-next-line no-unused-vars
  handleDateChange: (index: number, startDate: boolean, value: string) => void;
  handleAddDate: () => void;
  // eslint-disable-next-line no-unused-vars
  handleRemoveDate: (index: number) => void;
}

export default function EditDates({
  dates,
  handleDateChange,
  handleAddDate,
  handleRemoveDate
}: EditDatesProps) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
        <DateTimePicker
          label={text('Start Date', 'Startdatum')}
          value={moment(dates[0].startDateTime)}
          onChange={(date) => handleDateChange(0, true, date!.toISOString())}
        />
        <DateTimePicker
          label={text('End Date', 'Einddatum')}
          value={moment(dates[0].endDateTime)}
          onChange={(date) => handleDateChange(0, false, date!.toISOString())}
        />
      </div>
      {dates.slice(1).map((date, index) => (
        <div key={index} className="flex justify-between gap-3">
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <DateTimePicker
              label={`${text('Start Date', 'Startdatum')} ${index + 2}`}
              value={moment(date.startDateTime)}
              onChange={(date) => handleDateChange(index + 1, true, date!.toISOString())}
            />
            <DateTimePicker
              label={`${text('End Date', 'Einddatum')} ${index + 2}`}
              value={moment(date.endDateTime)}
              onChange={(date) => handleDateChange(index + 1, false, date!.toISOString())}
            />
          </div>
          <div className="flex items-center">
            <Tooltip title={text('Delete Date', 'Verwijder Datum')}>
              <Fab size="small" color="error" onClick={() => handleRemoveDate(index + 1)}>
                <DeleteIcon />
              </Fab>
            </Tooltip>
          </div>
        </div>
      ))}
      <div className="flex justify-center">
        <Tooltip title={text('Add Date', 'Voeg Datum Toe')}>
          <Fab size="small" color="primary" onClick={() => handleAddDate()}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>
    </div>
  );
}
