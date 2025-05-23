import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Language, rentOptions, ReservationItemType, ReservationType } from '../../types';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import moment from 'moment/moment';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface ItemsTableProps {
  reservation: ReservationType;
  onAmountChange: (name: string, increment: boolean) => void;
}

export default function ItemsTable({
  reservation,
  onAmountChange
}: ItemsTableProps) {
  const { text } = useLanguage();
  const findRemark = (itemName: Language): Language => {
    const rentOption = rentOptions.find(
      (option) => option.name.en === itemName.en
    );
    return rentOption?.remark || { en: '', nl: '' };
  };

  const findInterval = (remark?: { en: string; nl: string }): Language => {
    if (remark?.en.includes('per month after 1 month')) {
      return { en: 'month', nl: 'maand' };
    } else if (remark?.en.includes('per month')) {
      return { en: 'month', nl: 'maand' };
    } else if (remark?.en.includes('for max. 6 months')) {
      return { en: 'max 6 months', nl: 'max 6 maanden' };
    } else if (remark?.en.includes('per week')) {
      return { en: 'week', nl: 'week' };
    } else {
      return { en: 'day', nl: 'dag' };
    }
  };
  const calculateItemTotal = (
    price: number,
    days: number,
    remark?: { en: string; nl: string }
  ) => {
    if (remark?.en.includes('per month after 1 month')) {
      const months = Math.max(Math.round(days / 30), 1);
      if (months > 1) {
        return 5 * (months - 1);
      } else {
        return 0;
      }
    } else if (remark?.en.includes('per month')) {
      const months = Math.max(Math.round(days / 30), 1);
      return price * months;
    } else if (remark?.en.includes('for max. 6 months')) {
      return price;
    } else if (remark?.en.includes('per week')) {
      const weeks = Math.max(Math.round(days / 7), 1);
      return price * weeks;
    } else {
      return price * days;
    }
  };

  const calculateDays = (): number => {
    if (!reservation.startDate || !reservation.endDate) {
      return 0;
    }
    return (
      moment(reservation.endDate).diff(moment(reservation.startDate), 'days') +
      1
    );
  };

  return (
    <div className="grid gap-4">
      <Table>
        {reservation.items.length > 0 && (
          <TableHead>
            <TableRow>
              <TableCell>{text('Material', 'Materiaal')}</TableCell>
              <TableCell>{text('Price', 'Prijs')}</TableCell>
              <TableCell>{text('Amount', 'Aantal')}</TableCell>
              <TableCell>{text('Total', 'Totaal')}</TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {reservation.items.map((item: ReservationItemType) => (
            <TableRow key={item.name.en}>
              <TableCell>{text(item.name.en, item.name.nl)}</TableCell>
              <TableCell>{`€${item.price.toFixed(2)}/${text(findInterval(findRemark(item.name)))}`}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <IconButton
                    color="primary"
                    onClick={() => onAmountChange(item.name.en, false)}
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                  {item.amount}
                  <IconButton
                    color="primary"
                    onClick={() => onAmountChange(item.name.en, true)}
                    size="small"
                  >
                    <AddIcon />
                  </IconButton>
                </div>
              </TableCell>
              <TableCell>{`€${(item.price * item.amount).toFixed(2)}/${text(findInterval(findRemark(item.name)))}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <h4>
        {text(
          'Total price for ' + calculateDays() + ' day(s):',
          'Totale prijs voor ' + calculateDays() + ' dag(en):'
        )}
        {` €${reservation.items.reduce((sum, item) => {
          return (
            sum +
            calculateItemTotal(
              item.price * item.amount,
              calculateDays(),
              findRemark(item.name)
            )
          );
        }, 0).toFixed(2)}`}
      </h4>
    </div>
  );
}
