import ContentCard from '../ContentCard.tsx';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { EventType, WeekendType } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface AgendaFilterProps {
  category: string;
  setCategory: (category: EventType | 'all') => void;
  type: string;
  setType: (type: WeekendType | 'all') => void;
}

export default function AgendaFilter({
  category,
  setCategory,
  type,
  setType
}: AgendaFilterProps) {
  const { text } = useLanguage();
  return (
    <ContentCard className="xl:col-span-1 lg:col-span-2">
      <h2 className="mb-3">{text('Filter', 'Filteren')}</h2>
      <div className="grid gap-3">
        <FormControl fullWidth>
          <InputLabel id="select-label">
            {text('Category', 'Categorie')}
          </InputLabel>
          <Select
            labelId="select-label"
            value={category}
            label={text('Category', 'Categorie')}
            onChange={(e) =>
              setCategory(e.target.value as EventType | 'all')
            }
            variant="outlined"
          >
            <MenuItem value="all">
              {text('All', 'Alles')}
            </MenuItem>
            <MenuItem value="activity">
              {text('Activities', 'Activiteiten')}
            </MenuItem>
            <MenuItem value="course">
              {text('Courses', 'Cursussen')}
            </MenuItem>
            <MenuItem value="training">
              {text('Trainings', 'Trainingen')}
            </MenuItem>
            <MenuItem value="weekend">
              {text('Weekends', 'Weekenden')}
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="select-label">
            {text('Type', 'Type')}
          </InputLabel>
          <Select
            labelId="select-label"
            value={type}
            label={text('Type', 'Type')}
            onChange={(e) =>
              setType(e.target.value as WeekendType | 'all')
            }
            variant="outlined"
          >
            <MenuItem value="all">
              {text('All', 'Alles')}
            </MenuItem>
            <MenuItem value="sp">
              {text('Single Pitch', 'Single Pitch')}
            </MenuItem>
            <MenuItem value="mp">
              {text('Multi Pitch', 'Multi Pitch')}
            </MenuItem>
            <MenuItem value="education">
              {text('Education', 'Educatie')}
            </MenuItem>
            <MenuItem value="boulder">
              {text('Bouldering', 'Boulderen')}
            </MenuItem>
            <MenuItem value="trad">
              {text('Trad', 'Trad')}
            </MenuItem>
          </Select>
        </FormControl>
      </div>
    </ContentCard>

  );

}