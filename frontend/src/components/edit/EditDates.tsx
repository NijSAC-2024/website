import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DateType, EventContent } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditDatesProps {
  dates: DateType[];
  handleEventChange: (update: Partial<EventContent>) => void;
}

export default function EditDates({
  dates,
  handleEventChange
}: EditDatesProps) {
  const { text } = useLanguage();

  return (
    <>
      <hr />
      Dates
      <div className="grid gap-3">
        {dates.length > 0 && (
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <DateTimePicker
              label={text('Start Date', 'Startdatum')}
              value={moment(dates[0].start)}
              onChange={(date) => {handleDateChange(0, true, date!.toISOString()); console.log(date!.toISOString());}}
            />
            <DateTimePicker
              label={text('End Date', 'Einddatum')}
              value={moment(dates[0].end)}
              onChange={(date) => handleDateChange(0, false, date!.toISOString())}
            />
          </div>
        )}
        {dates.slice(1).map((date, index) => (
          <div key={index} className="flex justify-between gap-3">
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
              <DateTimePicker
                label={`${text('Start Date', 'Startdatum')} ${index + 2}`}
                value={moment(date.start)}
                onChange={(date) =>
                  handleDateChange(index + 1, true, date!.toISOString())
                }
              />
              <DateTimePicker
                label={`${text('End Date', 'Einddatum')} ${index + 2}`}
                value={moment(date.end)}
                onChange={(date) =>
                  handleDateChange(index + 1, false, date!.toISOString())
                }
              />
            </div>
            <div className="flex items-center">
              <Tooltip title={text('Delete Date', 'Verwijder Datum')}>
                <Fab
                  size="small"
                  color="error"
                  onClick={() => handleRemoveDate(index + 1)}
                >
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
    </>
    <>
      <hr />
      Dates
      <div className="grid gap-3">
        {dates.map((date, index) => (
          <div key={index} className={`justify-between gap-3 ${index ? 'flex' : ''}`}>
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
              <DateTimePicker
                label={`${text('Start Date', 'Startdatum')} ${index + 1}`}
                value={moment(date.start)}
                onChange={(date) => {
                  dates[index] = { start: date!.toISOString(), end: dates[0].end };
                  handleEventChange({
                    dates
                  });
                }}
              />
              <DateTimePicker
                label={`${text('End Date', 'Einddatum')} ${index + 1}`}
                value={moment(date.end)}
                onChange={(date) => {
                  dates[index] = { end: date!.toISOString(), start: dates[0].start };
                  handleEventChange({
                    dates
                  });
                }}
              />
            </div>
            {index !== 0 && (
              <div className="flex items-center">
                <Tooltip title={text('Delete Date', 'Verwijder Datum')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleEventChange({ dates: dates.filter((_, i) => i !== index) })}
                  >
                    <DeleteIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-center">
          <Tooltip title={text('Add Date', 'Voeg Datum Toe')}>
            <IconButton size="small" color="primary" onClick={() => {
              const now = new Date();
              handleEventChange({ dates: [...dates, { start: now.toISOString(), end: now.toISOString() }] });
            }}
            >
              <AddIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
