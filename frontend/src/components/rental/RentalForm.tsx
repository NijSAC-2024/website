import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { rentOption, ReservationItemType, ReservationType } from '../../types.ts';
import ItemSelection from './ItemSelection.tsx';
import ItemsTable from './ItemsTable.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface RentalFormProps {
  reservation: ReservationType;
  handleReservationChange: (
    name: keyof ReservationType,
    value: string | ReservationItemType[]
  ) => void;
  handleReservationSubmit: (reservation: ReservationType) => void;
}

export default function RentalForm({
  reservation,
  handleReservationChange,
  handleReservationSubmit
}: RentalFormProps) {
  const { text } = useLanguage();
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
    handleReservationChange(
      'items',
      updatedReservation as ReservationItemType[]
    );
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2>{text('Rental Request', 'Huuraanvraag')}</h2>
        <p>
          {text(
            'Select your preferred usage dates. Once your request is approved, you can coordinate with the Matcie to agree on the pick-up and drop-off dates.',
            'Selecteer de gewenste gebruiksdata. Zodra je aanvraag is goedgekeurd, kun je contact opnemen met de Matcie om de ophaal- en retourdata af te stemmen.'
          )}
        </p>
      </div>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label={text('Start Date', 'Startdatum')}
            value={moment(reservation.startDate)}
            onChange={(date) =>
              handleReservationChange('startDate', date!.toISOString())
            }
          />
          <DatePicker
            label={text('End Date', 'Einddatum')}
            value={moment(reservation.endDate)}
            onChange={(date) =>
              handleReservationChange('endDate', date!.toISOString())
            }
          />
        </div>
        <ItemSelection
          selectedItem={selectedItem}
          onItemSelect={setSelectedItem}
          onAddItem={handleAddItem}
        />
      </div>

      <ItemsTable
        reservation={reservation}
        onAmountChange={handleAmountChange}
      />

      <TextField
        multiline
        value={reservation.remarks}
        label={text('Remarks', 'Opmerkingen')}
        onChange={(e) => handleReservationChange('remarks', e.target.value)}
      />

      <div className="grid gap-3">
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleReservationSubmit(reservation)}
          disabled={
            reservation.items.length === 0 ||
            moment(reservation.endDate).isBefore(moment(reservation.startDate))
          }
        >
          {text('Submit request*', 'Verstuur aanvraag*')}
        </Button>
        <p>
          {text(
            '* Please note that your request still needs to be approved by the Matcie. You can view your requests and their status on your account page.',
            '* Let op: je aanvraag moet nog worden goedgekeurd door de Matcie. Je kunt je aanvragen en de status ervan bekijken op je accountpagina.'
          )}
        </p>
      </div>
    </div>
  );
}
