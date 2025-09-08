import { useState } from 'react';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Checkbox,
} from '@mui/material';
import { OptionsType } from '../types.ts';
import { useLanguage } from '../providers/LanguageProvider.tsx';

interface OptionSelectorProps {
  options: OptionsType[];
  selected?: string[];
  onChange: (selectedOptions: string[]) => void;
  label: string;
}

export default function OptionSelector({
  options,
  selected,
  onChange,
  label,
}: OptionSelectorProps) {
  const { text } = useLanguage();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    selected || [],
  );

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedOptions(value);
    onChange(value);
  };


  return (
    <FormControl>
      <InputLabel id="checkbox-select-label">{label}</InputLabel>
      <Select
        labelId="checkbox-select-label"
        variant="outlined"
        multiple
        value={selectedOptions}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label={label} />}
        renderValue={(selected: string[]) => (
          <div className="flex flex-wrap gap-1">
            {selected.map((selected_id) => {
              const option = options.find((opt) => opt.id === selected_id);
              return (
                <Chip
                  key={selected_id}
                  label={
                    option
                      ? text( option.label.en, option.label.nl)
                      : selected_id
                  }
                  className="uppercase font-semibold"
                  size="small"
                />
              );
            })}
          </div>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option.id as string} value={option.id as string}>
            <Checkbox checked={selectedOptions.includes(option.id as string)} />
            {text(option.label.en, option.label.nl)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
