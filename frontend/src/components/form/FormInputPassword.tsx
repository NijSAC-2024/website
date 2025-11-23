import {Controller, FieldValues} from 'react-hook-form';
import {FormInputProps} from '../../types.ts';
import {FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {useState} from 'react';

export const FormInputPassword = <T extends FieldValues, >({name, control, disabled, label}: Omit<FormInputProps<T>, 'type'>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: {onChange, value},
        fieldState: {error},
        formState,
      }) =>
        (
          <>
            <InputLabel>{label}</InputLabel>
            <OutlinedInput
              value={value}
              type={showPassword ? 'text' : 'password'}
              onChange={onChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>
              }
              label={label}
              disabled={disabled || formState.isSubmitting}
              error={!!error}
            />
            {!!error && <FormHelperText>{error.message}</FormHelperText>}
          </>
        )}
    />
  );
};