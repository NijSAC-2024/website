import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { Fragment, useState } from 'react';
import { Location } from '../../types.ts';
import { text } from '../../util.ts';
import { apiFetch } from '../../api.ts';
import { enqueueSnackbar } from 'notistack';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

export default function EditLocation() {
  const { language: lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setOpen(true);

    setLoading(true);
    const { error, data } = await apiFetch<Location[]>(
      '/location?reusable=true&limit=2&offset=0',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (error) {
      switch (error.message) {
      case 'Unauthorized':
        enqueueSnackbar('Incorrect email or password.', { variant: 'error' });
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, {
          variant: 'error'
        });
      }
    } else if (data) {
      setOptions(data);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(location) => text(lang, location.name)}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={text(lang, 'Location', 'Locatie')}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </Fragment>
              )
            }
          }}
        />
      )}
    />
  );
}
