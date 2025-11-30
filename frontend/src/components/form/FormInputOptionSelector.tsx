import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Checkbox,
} from '@mui/material';
import {Controller, FieldValues} from 'react-hook-form';
import {FormInputProps} from '../../types.ts';

export default function FormInputOptionSelector<T extends FieldValues, >({
  name,
  control,
  disabled,
  label,
  size,
  className,
  options
}: FormInputProps<T> & {
  options: Array<{ label: string, value: string }>
}) {

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
            <InputLabel id="checkbox-select-label">{label}</InputLabel>
            <Select
              labelId="checkbox-select-label"
              variant="outlined"
              multiple
              value={value || []}
              size={size}
              error={!!error}
              disabled={disabled || formState.isSubmitting}
              onChange={onChange}
              input={<OutlinedInput id="select-multiple-chip" label={label}/>}
              renderValue={(selected: string[]) => (
                <div className="flex flex-wrap gap-1">
                  {selected.map((selected_id) => {
                    const option = options.find((opt) => opt.value === selected_id);
                    return (
                      <Chip
                        key={selected_id}
                        label={option?.label || selected_id}
                        className="uppercase font-semibold"
                        size="small"
                      />
                    );
                  })}
                </div>
              )}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={value?.includes(option.value) || false}/>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}/>
  );
}
