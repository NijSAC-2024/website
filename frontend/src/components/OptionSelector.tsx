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
import { OptionsType } from '../types.ts';

interface OptionSelectorProps {
  options: OptionsType[];
  onChange: (selectedOptions: OptionsType[]) => void;
  label: string;
}

export default function OptionSelector({
  options,
  onChange,
  label,
}: OptionSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<OptionsType[]>(options);

  const handleChange = (value: string | OptionsType[]) => {
    const selectedValues = typeof value === 'string' ? value.split(',') : value;
    setSelectedOptions(selectedValues as OptionsType[]);
    onChange(selectedValues as OptionsType[]);
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
