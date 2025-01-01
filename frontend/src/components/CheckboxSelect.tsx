import { useState } from 'react';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Checkbox
} from '@mui/material';
import { text } from '../util.ts';
import { CheckboxOptionType, CheckboxType } from '../types.ts';

interface CheckboxSelectProps {
  options: CheckboxOptionType[];
  // eslint-disable-next-line no-unused-vars
  onChange: (selectedOptions: CheckboxType[]) => void;
  label: string;
  initialOptions: CheckboxType[];
}

export default function CheckboxSelect({
  options,
  onChange,
  label,
  initialOptions
}: CheckboxSelectProps) {
  const [selectedOptions, setSelectedOptions] = useState<CheckboxType[]>(initialOptions);

  const handleChange = (value: string | CheckboxType[]) => {
    const selectedValues = typeof value === 'string' ? value.split(',') : value;
    setSelectedOptions(selectedValues as CheckboxType[]);
    onChange(selectedValues as CheckboxType[]);
  };

  return (
    <FormControl>
      <InputLabel id="checkbox-select-label">{label}</InputLabel>
      <Select
        variant="outlined"
        multiple
        value={selectedOptions}
        onChange={(e) => handleChange(e.target.value)}
        input={<OutlinedInput id="select-multiple-chip" label={label} />}
        renderValue={(selected) => (
          <div className="flex flex-wrap space-x-1">
            {selected.map((id) => {
              const option = options.find((opt) => opt.id === id);
              return (
                <Chip
                  key={id}
                  label={option ? text(option.label.en, option.label.nl) : id}
                  className="uppercase font-semibold"
                  size="small"
                />
              );
            })}
          </div>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            <Checkbox checked={selectedOptions.includes(option.id)} />
            {text(option.label.en, option.label.nl)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
