import { TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { ValidateProps } from '../types.ts';

export default function ValidatedTextField({
  label,
  validator,
  onChange,
  setValue, value,
}: ValidateProps) {
  const [error, setError] = useState<string | false>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    const errorMessage = validator(newValue);
    setError(errorMessage);
    onChange(!errorMessage);
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error || ''}
      fullWidth
      label={label}
    />
  );
}
