import {Controller, FieldValues} from 'react-hook-form';
import { FormInputProps} from '../../types.ts';
import {FormControl, InputLabel, MenuItem, Select} from '@mui/material';


export const FormInputSelect = <T extends FieldValues, >({
  name,
  control,
  disabled,
  label,
  size,
  className,
  options
}: FormInputProps<T> & {
  options: Array<{ label: string, value: string }>
}) => {
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
          <FormControl className={className}>
            <InputLabel id="select-label">
              {label}
            </InputLabel>
            <Select
              labelId="select-label"
              onChange={onChange}
              value={value}
              label={label}
              disabled={disabled || formState.isSubmitting}
              size={size}
              variant="outlined"
              error={!!error}
            >
              {options.map(({value, label}) => (
                <MenuItem value={value} id={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
    />
  );
};