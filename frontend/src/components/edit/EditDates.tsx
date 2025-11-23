import {DateTimePicker} from '@mui/x-date-pickers';
import moment from 'moment';
import {IconButton, Tooltip} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {DateType, EventContent} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

interface EditDatesProps {
  dates: DateType[];
  handleEventChange: (update: Partial<EventContent>) => void;
}

export default function EditDates({
  dates,
  handleEventChange
}: EditDatesProps) {
  const {text} = useLanguage();

  return (
    <>
      <hr/>
      Dates
      <div className="grid gap-3">
        {dates.map((date, index) => (
          <div key={index} className={`justify-between gap-3 ${index ? 'flex' : ''}`}>
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
              <DateTimePicker
                label={`${text('Start Date', 'Startdatum')} ${index + 1}`}
                value={moment(date.start)}
                onChange={(date) => {
                  dates[index] = {start: date!.toISOString(), end: dates[index].end};
                  handleEventChange({
                    dates
                  });
                }}
              />
              <DateTimePicker
                label={`${text('End Date', 'Einddatum')} ${index + 1}`}
                value={moment(date.end)}
                onChange={(date) => {
                  handleEventChange({
                    dates: [
                      ...dates.slice(0, index), // Copy all elements *before* the index
                      {
                        ...dates[index], // Copy existing properties of the element at the index
                        end: date!.toISOString(), // Apply the change
                      },
                      ...dates.slice(index + 1) // Copy all elements *after* the index
                    ]
                  }
                  );
                }}
              />
            </div>
            {index !== 0 && (
              <div className="flex items-center">
                <Tooltip title={text('Delete Date', 'Verwijder Datum')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleEventChange({dates: dates.filter((_, i) => i !== index)})}
                  >
                    <DeleteIcon fontSize="medium"/>
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
              handleEventChange({dates: [...dates, {start: now.toISOString(), end: now.toISOString()}]});
            }}
            >
              <AddIcon fontSize="large"/>
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </>
  );
}