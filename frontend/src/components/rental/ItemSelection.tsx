import { rentOption, rentOptions } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { Autocomplete, Button, TextField } from '@mui/material';

interface ItemSelectionProps {
  selectedItem: rentOption | null;
  onItemSelect: (item: rentOption | null) => void;
  onAddItem: () => void;
}

export default function ItemSelection({
  selectedItem,
  onItemSelect,
  onAddItem
}: ItemSelectionProps) {
  const { text, language } = useLanguage();

  return (
    <>
      {language === 'en' ? (
        <Autocomplete
          options={rentOptions}
          getOptionLabel={(option) => option.name.en}
          renderOption={(props, option) => {
            const { ...optionProps } = props;
            return (
              <li {...optionProps}>
                <p>{option.name.en}</p>
                <b className="ml-1">{`€${option.price.toFixed(2)} ${option.remark?.en || ''}`}</b>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={text('Select Item', 'Selecteer Artikel')}
            />
          )}
          onChange={(_event, newValue) => onItemSelect(newValue)}
        />
      ) : (
        <Autocomplete
          options={rentOptions}
          getOptionLabel={(option) => option.name.nl}
          renderOption={(props, option) => {
            const { ...optionProps } = props;
            return (
              <li {...optionProps}>
                <p>{option.name.nl}</p>
                <b className="ml-1">{`€${option.price} ${option.remark?.nl || ''}`}</b>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={text('Select Item', 'Selecteer Artikel')}
            />
          )}
          onChange={(_event, newValue) => onItemSelect(newValue)}
        />
      )}
      <Button
        variant="contained"
        onClick={onAddItem}
        disabled={!selectedItem}
        fullWidth
      >
        {text('Add to request', 'Toevoegen aan aanvraag')}
      </Button>
    </>
  );
}
