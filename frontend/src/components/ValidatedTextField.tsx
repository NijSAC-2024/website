import { TextField } from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';
import { ValidateProps } from '../types.ts';

export default function ValidatedTextField({
  label,
  validator,
  onChange,
  setValue, 
  value,
  validate,
}: ValidateProps) {
  const [error, setError] = useState<string | false>(false);

  useEffect(() => {
    if (validate) {
      const errorMessage = validator(value);
      setError(errorMessage);
      onChange(!errorMessage);
    }
  }, [validate, validator, onChange])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
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
