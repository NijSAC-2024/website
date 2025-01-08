import { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { text } from '../util.ts';
import { rentOption, rentOptions, ReservationItemType, ReservationType } from '../types.ts';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useLanguage } from '../providers/LanguageProvider.tsx';

interface RentalFormProps {
  reservation: ReservationType;
  handleReservationChange: (
    // eslint-disable-next-line no-unused-vars
    name: keyof ReservationType,
    // eslint-disable-next-line no-unused-vars
    value: string | ReservationItemType[]
  ) => void;
  // eslint-disable-next-line no-unused-vars
  handleReservationSubmit: (reservation: ReservationType) => void;
}

export default function RentalForm({
  reservation,
  handleReservationChange,
  handleReservationSubmit
}: RentalFormProps) {
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  const [selectedItem, setSelectedItem] = useState<rentOption | null>(null);

  const calculateDays = () => {
    if (!reservation.startDate || !reservation.endDate) return 0;
    return moment(reservation.endDate).diff(moment(reservation.startDate), 'days') + 1;
  };

  const handleAddItem = () => {
    if (selectedItem) {
      const existingItemIndex = reservation.items.findIndex(
        (item) => item.name.en === selectedItem.name.en
      );

      if (existingItemIndex !== -1) {
        const updatedReservation = [...reservation.items];
        updatedReservation[existingItemIndex].amount += 1;
        handleReservationChange('items', updatedReservation);
      } else {
        handleReservationChange('items', [
          ...reservation.items,
          {
            name: selectedItem.name,
            price: selectedItem.price,
            amount: 1
          }
        ]);
      }
    }
  };

  const handleAmountChange = (name: string, increment: boolean) => {
    const updatedReservation = reservation.items
      .map((item) => {
        if (item.name.en === name) {
          const newAmount = increment ? item.amount + 1 : item.amount - 1;
          return newAmount > 0
            ? {
                ...item,
                amount: newAmount
              }
            : null;
        }
        return item;
      })
      .filter((item) => item !== null);
    handleReservationChange('items', updatedReservation as ReservationItemType[]);
  };

  return (
    <div className="grid space-y-5">
      <h2>{text('Rental Form', 'Huurformulier')}</h2>
      <div className="grid space-y-3">
        <div className="flex gap-3">
          <DatePicker
            label={text('Start Date', 'Startdatum')}
            value={moment(reservation.startDate)}
            onChange={(date) => handleReservationChange('startDate', date!.toISOString())}
          />
          <DatePicker
            label={text('End Date', 'Einddatum')}
            value={moment(reservation.endDate)}
            onChange={(date) => handleReservationChange('endDate', date!.toISOString())}
          />
        </div>
        {langCode === 'en' ? (
          <Autocomplete
            options={rentOptions}
            getOptionLabel={(option) => option.name.en}
            renderOption={(props, option) => {
              const { ...optionProps } = props;
              return (
                <li {...optionProps}>
                  {option.name.en}
                  <b>{`€${option.price} ${option.remark?.en || ''}`}</b>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={text('Select Item', 'Selecteer Artikel')} />
            )}
            onChange={(_event, newValue) => setSelectedItem(newValue)}
          />
        ) : (
          <Autocomplete
            options={rentOptions}
            getOptionLabel={(option) => option.name.nl}
            renderOption={(props, option) => {
              const { ...optionProps } = props;
              return (
                <li {...optionProps}>
                  {option.name.nl}
                  <b>{`€${option.price} ${option.remark?.nl || ''}`}</b>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={text('Select Item', 'Selecteer Artikel')} />
            )}
            onChange={(_event, newValue) => setSelectedItem(newValue)}
          />
        )}
        <Button variant="contained" onClick={handleAddItem} disabled={!selectedItem} fullWidth>
          {text('Add to reservation', 'Toevoegen aan reservering')}
        </Button>
      </div>
      <div className="grid space-y-2">
        <h3>{text('Selected Items', 'Geselecteerde Artikelen')}</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{text('Material', 'Materiaal')}</TableCell>
              <TableCell>{text('Price/Day', 'Prijs/Dag')}</TableCell>
              <TableCell>{text('Amount', 'Aantal')}</TableCell>
              <TableCell>{text('Total/Day', 'Totaal/Dag')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservation.items.map((item) => (
              <TableRow key={item.name.en}>
                <TableCell>{text(item.name.en, item.name.nl)}</TableCell>
                <TableCell>{`€ ${item.price}`}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <IconButton
                      color="primary"
                      onClick={() => handleAmountChange(item.name.en, false)}
                      size="small">
                      <RemoveIcon />
                    </IconButton>
                    {item.amount}
                    <IconButton
                      color="primary"
                      onClick={() => handleAmountChange(item.name.en, true)}
                      size="small">
                      <AddIcon />
                    </IconButton>
                  </div>
                </TableCell>
                <TableCell>{`€ ${item.price * item.amount}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h4>
          {text(
            'Total Price for ' + calculateDays() + ' day(s):',
            'Totale Prijs voor ' + calculateDays() + ' dag(en):'
          )}
          {` € ${(
            reservation.items.reduce((sum, item) => sum + item.price * item.amount, 0) *
            calculateDays()
          ).toFixed(2)}`}
        </h4>
      </div>
      <TextField
        multiline
        value={reservation.remark}
        label={text('Remarks', 'Opmerkingen')}
        onChange={(e) => handleReservationChange('remark', e.target.value)}
      />
      <div className="grid space-y-3">
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleReservationSubmit(reservation)}
          disabled={reservation.items.length === 0}>
          {text('Submit Reservation', 'Verstuur Reservering')}
        </Button>
        <p>
          {text(
            '*Note that your reservation still has to be accepted by the Climbing Commissioner. You can see your reservations and their status on your profile page.',
            '*Merk op dat de reservering eerst nog moet worden goedgekeurd door de klimcommissaris. Je kan je reserveringen en hun status zien op je profiel pagina.'
          )}
        </p>
      </div>
    </div>
  );
}
