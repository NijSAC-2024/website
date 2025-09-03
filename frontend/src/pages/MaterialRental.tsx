import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { rentOptions, ReservationItemType, ReservationType } from '../types.ts';
import { useState } from 'react';
import RentalForm from '../components/rental/RentalForm.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';

export default function MaterialRental() {
  const { text } = useLanguage();
  const { isLoggedIn, toggleAuthOpen } = useAuth();
  const [rentFormOpen, setRentFormOpen] = useState<boolean>(false);
  const now = new Date();
  const [reservation, setReservation] = useState<ReservationType>({
    startDate: now.toISOString(),
    endDate: now.toISOString(),
    items: []
  });

  const handleReservationSubmit = (reservation: ReservationType) => {
    //Handle backEnd
    console.log(reservation);
    setRentFormOpen(false);
    setReservation({
      startDate: now.toISOString(),
      endDate: now.toISOString(),
      items: []
    });
  };

  const updateReservation = (changes: Partial<ReservationType>) => {
    setReservation((prev) => ({ ...prev, ...changes }));
  };

  const handleReservationChange = (
    name: keyof ReservationType,
    value: string | ReservationItemType[]
  ) => {
    updateReservation({
      [name]: value
    });
  };

  const toggleDialog = () => {
    setRentFormOpen((prevState) => !prevState);
  };

  return (
    <>
      <GenericPage>
        <ContentCard className="p-7">
          <h1>{text('Material Rental', 'Materiaalverhuur')}</h1>
          <p>
            {text(
              'The NijSAC has an extensive material depot that contains both summer and winter material. As a NijSAC member or affiliated it is possible to rent material from this. Priority is given in this order. You can fill in a rental request and (unless otherwise stated) pick the material up and return it to the mathok. In addition, the NijSAC also rents topo\'s, guides and maps. See below for all possibilities.',
              'De NijSAC beschikt over een uitgebreid materiaal voorraad met zowel zomer- als wintermateriaal. Als NijSAC-lid of aangeslotene is het mogelijk om hier materiaal van te huren. In deze volgorde wordt prioriteit gegeven. U kunt een huuraanvraag indienen en (tenzij anders vermeld) het materiaal ophalen en terugbrengen bij het mathok. Daarnaast verhuurt de NijSAC ook topo\'s, gidsen en kaarten. Zie onder voor alle mogelijkheden.'
            )}
          </p>

          <div className="mt-5">
            <h2>{text('Conditions for rental', 'Huurvoorwaarden')}</h2>
            <p>
              {text(
                'By making a rental reservation you agree to the ',
                'Door het maken van een huurreservering gaat je akkoord met het '
              )}
              <Link href={'https://nijsac.nl/api/file/serve/66be0721c0839'}>
                {text(
                  'material regulations (Dutch)',
                  'materiaalregelement'
                )}
              </Link>
              {text(
                '. A short summary of the rental conditions:',
                '. Een korte samenvatting van de huurvoorwaarden:'
              )}
            </p>
            <ul className="list-disc ml-5">
              <li>
                {text(
                  'The treasurer sends the rent to be transferred via an invoice.',
                  'De penningmeester verstuurt de over te dragen huur via een factuur.'
                )}
              </li>
              <li>
                {text(
                  'The rented property is collected and returned to the Climbing Commissioner. The tenant is responsible for this.',
                  'Het gehuurde wordt opgehaald en teruggegeven aan de klimcommissaris. De huurder is hiervoor verantwoordelijk.'
                )}
              </li>
              <li>
                {text(
                  'Return the materials quickly after use. Return it as it was rented. If material is returned too late, is lost or damaged due to carelessness, the amount due will be recovered from the tenants. Any damage will be noted in advance.',
                  'Breng de materialen na gebruik snel terug. Breng het terug zoals het werd verhuurd. Indien materiaal te laat wordt ingeleverd, door onzorgvuldigheid verloren gaat of beschadigd raakt, wordt het verschuldigde bedrag op de huurders verhaald. Eventuele schade wordt vooraf vermeld.'
                )}
              </li>
            </ul>
          </div>
          <div className="mt-5">
            <Button
              fullWidth
              onClick={isLoggedIn ? toggleDialog : toggleAuthOpen}
              variant="contained"
            >
              {isLoggedIn
                ? text('Make Request', 'Dien aanvraag in')
                : text(
                  'Login to make a request',
                  'Login om een aanvraag in te dienen'
                )}
            </Button>
          </div>
          <div className="mt-5">
            <h2>{text('Costs overview', 'Kostenoverzicht')}</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{text('Material', 'Materiaal')}</TableCell>
                  <TableCell>
                    {text(
                      'Rental price per day of use, unless otherwise stated',
                      'Huurprijs per gebruiksdag, tenzij anders aangegeven'
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentOptions.map((row) => (
                  <TableRow
                    key={row.name.en}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {text(row.name.en, row.name.nl)}
                    </TableCell>
                    <TableCell>
                      {'€' +
                        row.price +
                        ' ' +
                        text(row.remark?.en || '', row.remark?.nl || '')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ContentCard>
      </GenericPage>
      <Dialog open={rentFormOpen} onClose={toggleDialog} fullWidth>
        <DialogContent>
          <RentalForm
            reservation={reservation}
            handleReservationChange={handleReservationChange}
            handleReservationSubmit={handleReservationSubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
