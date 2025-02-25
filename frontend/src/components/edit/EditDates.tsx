import { DateTimePicker } from '@mui/x-date-pickers';
import { text } from '../../util.ts';
import moment from 'moment';
import { Fab, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DateType } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditDatesProps {
  dates: DateType[];
  handleDateChange: (index: number, startDate: boolean, value: string) => void;
  handleAddDate: () => void;
  handleRemoveDate: (index: number) => void;
}

export default function EditDates({
  dates,
  handleDateChange,
  handleAddDate,
  handleRemoveDate
}: EditDatesProps) {
  const { language: lang } = useLanguage();

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
        <DateTimePicker
          label={text(lang, 'Start Date', 'Startdatum')}
          value={moment(dates[0].start)}
          onChange={(date) => handleDateChange(0, true, date!.toISOString())}
        />
        <DateTimePicker
          label={text(lang, 'End Date', 'Einddatum')}
          value={moment(dates[0].end)}
          onChange={(date) => handleDateChange(0, false, date!.toISOString())}
        />
      </div>
      {dates.slice(1).map((date, index) => (
        <div key={index} className="flex justify-between gap-3">
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <DateTimePicker
              label={`${text(lang, 'Start Date', 'Startdatum')} ${index + 2}`}
              value={moment(date.start)}
              onChange={(date) => handleDateChange(index + 1, true, date!.toISOString())}
            />
            <DateTimePicker
              label={`${text(lang, 'End Date', 'Einddatum')} ${index + 2}`}
              value={moment(date.end)}
              onChange={(date) => handleDateChange(index + 1, false, date!.toISOString())}
            />
          </div>
          <div className="flex items-center">
            <Tooltip title={text(lang, 'Delete Date', 'Verwijder Datum')}>
              <Fab size="small" color="error" onClick={() => handleRemoveDate(index + 1)}>
                <DeleteIcon />
              </Fab>
            </Tooltip>
          </div>
        </div>
      ))}
      <div className="flex justify-center">
        <Tooltip title={text(lang, 'Add Date', 'Voeg Datum Toe')}>
          <Fab size="small" color="primary" onClick={() => handleAddDate()}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>
    </div>
  );
}
