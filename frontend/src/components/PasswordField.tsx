import {ChangeEventHandler, MouseEvent, useState} from 'react';
import { IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
}

export default function PasswordField({
  label,
  value,
  onChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        value={value}
        type={showPassword ? 'text' : 'password'}
        onChange={onChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
    </>
  );
}
