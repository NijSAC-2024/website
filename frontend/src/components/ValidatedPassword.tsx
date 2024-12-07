import { ChangeEvent, MouseEvent, useState } from 'react';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ValidateProps } from '../types.ts';
import { text } from '../util.ts';

export default function ValidatedPassword({ label, validator, onChange, setValue }: ValidateProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | false>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    const errorMessage = validator(newValue);
    setError(errorMessage);
    onChange(!errorMessage);
  };

  return (
    <FormControl variant="outlined" className="w-full" error={!!error}>
      <InputLabel>{text('Password', 'Wachtwoord')}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        onChange={handlePasswordChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
