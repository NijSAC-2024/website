import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { text } from '../../util.ts';
import { rentOption, ReservationItemType, ReservationType } from '../../types.ts';
import ItemSelection from './ItemSelection.tsx';
import ItemsTable from './ItemsTable.tsx';

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
  const [selectedItem, setSelectedItem] = useState<rentOption | null>(null);

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
      <h2>{text('Rental Request', 'Huuraanvraag')}</h2>

      <div className="grid space-y-3">
        <div className="grid grid-cols-2 gap-3">
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
        <ItemSelection
          selectedItem={selectedItem}
          onItemSelect={setSelectedItem}
          onAddItem={handleAddItem}
        />
      </div>

      <ItemsTable reservation={reservation} onAmountChange={handleAmountChange} />

      <TextField
        multiline
        value={reservation.remarks}
        label={text('Remarks', 'Opmerkingen')}
        onChange={(e) => handleReservationChange('remarks', e.target.value)}
      />

      <div className="grid space-y-3">
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleReservationSubmit(reservation)}
          disabled={
            reservation.items.length === 0 ||
            moment(reservation.endDate).isBefore(moment(reservation.startDate))
          }
        >
          {text('Submit request', 'Verstuur aanvraag')}
        </Button>
        <p>
          {text(
            '*Note that your request still has to be accepted by the Climbing Commissioner. You can see your requests and their status on your account page.',
            '*Merk op dat de aanvraag eerst nog moet worden goedgekeurd door de klimcommissaris. Je kan je aanvragen en hun status zien op je account pagina.'
          )}
        </p>
      </div>
    </div>
  );
}
