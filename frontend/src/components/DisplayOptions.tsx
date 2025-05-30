import {FormControlLabel, FormControl, Radio, RadioGroup} from '@mui/material';
import {Language} from '../types.ts';
import {useLanguage} from '../providers/LanguageProvider.tsx';

interface DisplayOptionsProps {
  options: {name: Language, value: string}[];
  onChange: (value: string) => void;
  value: string;
  title: string;
}

export default function DisplayOptions({options, onChange, value, title}: DisplayOptionsProps) {
  const { text } = useLanguage();

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <FormControl>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          value={value}
          name="radio-buttons-group"
          onChange={event => onChange(event.target.value)}
        >
          {options.map((option) => (
            <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={text(option.name)} />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  );
}