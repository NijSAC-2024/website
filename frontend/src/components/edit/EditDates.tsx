import {DateTimePicker} from '@mui/x-date-pickers';
import moment from 'moment';
import {IconButton, Tooltip} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {memo} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {EventContent} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

function EditDates() {
  const {text} = useLanguage();
  const {control} = useFormContext<EventContent>();
  const {fields, append, remove, update} = useFieldArray({
    control,
    name: 'dates'
  });

  return (
    <>
      <hr/>
      Dates
      <div className="grid gap-3">
        {fields.map((date, index) => (
          <div key={index} className={`justify-between gap-3 ${index ? 'flex' : ''}`}>
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
              <DateTimePicker
                label={`${text('Start Date', 'Startdatum')} ${index + 1}`}
                value={moment(date.start)}
                onChange={(date) => {
                  if (!date) {
                    return;
                  }
                  update(index, {start: date.toISOString(), end: fields[index].end});
                }}
              />
              <DateTimePicker
                label={`${text('End Date', 'Einddatum')} ${index + 1}`}
                value={moment(date.end)}
                onChange={(date) => {
                  if (!date) {
                    return;
                  }
                  update(index, {
                    start: fields[index].start,
                    end: date.toISOString()
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
                    onClick={() => remove(index)}
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
              append({start: now.toISOString(), end: now.toISOString()});
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

export default memo(EditDates);
