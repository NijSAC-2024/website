import {Controller, FieldValues} from 'react-hook-form';
import TextField from '@mui/material/TextField';
import {FormInputProps} from '../../types.ts';

export const FormInputText = <T extends FieldValues, >({name, control, disabled, type, autoComplete, label, size}: FormInputProps<T>) => {
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
          <TextField
            type={type}
            helperText={error ? error.message : null}
            size={size || 'small'}
            error={!!error}
            onChange={onChange}
            value={value}
            fullWidth
            disabled={disabled || formState.isSubmitting}
            variant="outlined"
            label={label}
            autoComplete={autoComplete}
          />
        )}
    />
  );
};