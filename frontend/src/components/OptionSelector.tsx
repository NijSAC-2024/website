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
  const { language: lang } = useLanguage();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(selected || []);

  const handleChange = (value: string[]) => {
    // const selectedValues = value.split(',');
    setSelectedOptions(value);
    onChange(value);
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
            {selected.map((selected_id) => {
              console.log('selected: ', selected);
              const option = options.find((opt) => opt.id === selected_id);
              return (
                <Chip
                  key={selected_id}
                  label={option ? text(lang, option.label.en, option.label.nl) : selected_id}
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
            {text(lang, option.label.en, option.label.nl)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
