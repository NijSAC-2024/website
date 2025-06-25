import {ChangeEventHandler, MouseEvent, useState} from 'react';
import { IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLanguage } from '../providers/LanguageProvider.tsx';

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
  const { text } = useLanguage();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <InputLabel>{text('Password', 'Wachtwoord')}</InputLabel>
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
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
    </>
  );
}
