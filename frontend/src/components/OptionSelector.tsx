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
import { OptionsType, OptionType } from '../types.ts';

interface OptionSelectorProps {
  options: OptionsType[];
  // eslint-disable-next-line no-unused-vars
  onChange: (selectedOptions: OptionType[]) => void;
  label: string;
  initialOptions: OptionType[];
}

export default function OptionSelector({
  options,
  onChange,
  label,
  initialOptions
}: OptionSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>(initialOptions);

  const handleChange = (value: string | OptionType[]) => {
    const selectedValues = typeof value === 'string' ? value.split(',') : value;
    setSelectedOptions(selectedValues as OptionType[]);
    onChange(selectedValues as OptionType[]);
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
          <div className="flex flex-wrap gap-1">
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
