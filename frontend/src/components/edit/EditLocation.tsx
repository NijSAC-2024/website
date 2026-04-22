import AddIcon from '@mui/icons-material/Add';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import {SyntheticEvent, useMemo, useState} from 'react';
import {Location, LocationContent} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useLocationHook} from '../../hooks/useLocationHook.ts';
import {IconButton, Tooltip} from '@mui/material';

interface EditLocationProps {
  value: string;
  onChange: (locationId: string) => void;
}

const emptyLocationContent: LocationContent = {
  name: {
    en: '',
    nl: ''
  },
  description: {
    en: '',
    nl: ''
  },
  reusable: true
};

const filterOptions = createFilterOptions<Location>({
  stringify: (location) =>
    `${location.name.en} ${location.name.nl} ${location.description?.en || ''} ${location.description?.nl || ''}`
});

export default function EditLocation({value, onChange}: EditLocationProps) {
  const {text} = useLanguage();
  const {useLocations, createLocation} = useLocationHook();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState<LocationContent>(emptyLocationContent);
  const [saving, setSaving] = useState(false);
  const locations = useLocations()

  const selectedLocation = useMemo(
    () => locations?.find((location) => location.id === value) || null,
    [locations, value]
  );

  const handleDialogClose = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setNewLocation(emptyLocationContent);
  };

  const handleLocationCreate = async () => {
    setSaving(true);
    const createdLocation = await createLocation(newLocation);
    setSaving(false);

    if (!createdLocation) {
      return;
    }

    onChange(createdLocation.id);
    handleDialogClose();
  };

  const handleAutocompleteChange = (_event: SyntheticEvent, location: typeof selectedLocation) => {
    onChange(location?.id || '');
  };

  return (
    <>
      <div className="grid grid-cols-5">
        <div className="col-span-4">
          <Autocomplete<Location, false, false, false>
            fullWidth
            options={locations ?? []}
            value={selectedLocation}
            filterOptions={filterOptions}
            onChange={handleAutocompleteChange}
            isOptionEqualToValue={(option, selected) => option.id === selected.id}
            getOptionLabel={(location) => text(location.name)}
            renderOption={(props, location) => (
              <li {...props} key={location.id}>
                <div>
                  <div>{text(location.name)}</div>
                  {(location.description?.en || location.description?.nl) && (
                    <div className="text-sm opacity-70">
                      {text(location.description)}
                    </div>
                  )}
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label={text('Location', 'Locatie')}
                placeholder={text('Search in English or Dutch', 'Zoek in het Engels of Nederlands')}
              />
            )}
          />
        </div>
        <div className="col-span-1 grid justify-center">
          <Tooltip title={text('Add Location', 'Voeg Locatie Toe')}>
            <IconButton size="small" color="primary"  onClick={() => setDialogOpen(true)}>
              <AddIcon fontSize="large"/>
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{text('Add Location', 'Locatie toevoegen')}</DialogTitle>
        <DialogContent>RSC
          <div className="grid gap-3">
            <TextField
              required
              label={text('Name English', 'Naam Engels')}
              value={newLocation.name.en}
              onChange={(event) =>
                setNewLocation({
                  ...newLocation,
                  name: {
                    ...newLocation.name,
                    en: event.target.value
                  }
                })
              }
            />
            <TextField
              required
              label={text('Name Dutch', 'Naam Nederlands')}
              value={newLocation.name.nl}
              onChange={(event) =>
                setNewLocation({
                  ...newLocation,
                  name: {
                    ...newLocation.name,
                    nl: event.target.value
                  }
                })
              }
            />
            <TextField
              multiline
              minRows={3}
              label={text('Description English', 'Beschrijving Engels')}
              value={newLocation.description?.en || ''}
              onChange={(event) =>
                setNewLocation({
                  ...newLocation,
                  description: {
                    en: event.target.value,
                    nl: newLocation.description?.nl || ''
                  }
                })
              }
            />
            <TextField
              multiline
              minRows={3}
              label={text('Description Dutch', 'Beschrijving Nederlands')}
              value={newLocation.description?.nl || ''}
              onChange={(event) =>
                setNewLocation({
                  ...newLocation,
                  description: {
                    en: newLocation.description?.en || '',
                    nl: event.target.value
                  }
                })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newLocation.reusable}
                  onChange={(event) =>
                    setNewLocation({
                      ...newLocation,
                      reusable: event.target.checked
                    })
                  }
                />
              }
              label={text('Reusable location', 'Herbruikbare locatie')}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={saving}>
            {text('Cancel', 'Annuleren')}
          </Button>
          <Button
            variant="contained"
            onClick={handleLocationCreate}
            loading={saving}
            disabled={!newLocation.name.en.trim() || !newLocation.name.nl.trim()}
          >
            {text('Save', 'Opslaan')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
