import { FormControlLabel, Checkbox } from '@mui/material';
import TextCard from '../TextCard.tsx';
import {StepProps} from '../../types.ts';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import moment from 'moment/moment';

export default function OverviewStep({
  formData,
  handleChange,
  handleBack,
  handleSubmit,
  validateInputs,
}: StepProps) {
  const { text } = useLanguage()
  return (
    <>
      <p>{text('Please confirm that all entered data is correct.', 'Bevestig dat alle ingevulde gegevens kloppen.')}</p>
      <TextCard className="px-6 py-5 mt-3 grid grid-cols-4 gap-5">
        <b>{text('First Name:', 'Voornaam:')}</b>
        <span className="col-span-3">{formData.firstName}</span>
        <b>{text('Infix:', 'Tussenvoegsel:')}</b>
        <span className="col-span-3">{formData.infix}</span>
        <b>{text('Last Name:', 'Achternaam:')}</b>
        <span className="col-span-3">{formData.lastName}</span>
        <b>{text('Date of Birth:', 'Geboortedatum:')}</b>
        <span className="col-span-3">{moment(formData.dateOfBirth).utc().format('DD MMM YYYY')}</span>
        <b>{text('Address:', 'Adres:')}</b>
        <span className="col-span-3">{formData.address}</span>
        <b>{text('Postal Code:', 'Postcode:')}</b>
        <span className="col-span-3">{formData.postalCodeCity}</span>
        <b>{text('Phone:', 'Telefoon:')}</b>
        <span className="col-span-3">{formData.phone}</span>
        <b>{text('Email:', 'E-mail:')}</b>
        <span className="col-span-3">{formData.email}</span>

        <b>{text('Educational Institution:', 'Onderwijsinstelling:')}</b>
        <span className="col-span-3">{formData.university}</span>
        <b>{text('Student Number:', 'Studentnummer:')}</b>
        <span className="col-span-3">{formData.studentNumber}</span>
        <b>{text('Sportcard Number:', 'Sportkaartnummer:')}</b>
        <span className="col-span-3">{formData.sportcardNumber}</span>
        <b>{text('NKBV Number:', 'NKBV-nummer:')}</b>
        <span className="col-span-3">{formData.nkbvNumber}</span>

        <b>{text('IBAN:', 'IBAN:')}</b>
        <span className="col-span-3">{formData.iban}</span>
        <b>{text('BIC:', 'BIC:')}</b>
        <span className="col-span-3">{formData.bic}</span>

        <b>{text('Emergency Contact Name:', 'Naam noodgevalcontact:')}</b>
        <span className="col-span-3">{formData.iceContactName}</span>
        <b>{text('Emergency Contact Phone:', 'Telefoon noodgevalcontact:')}</b>
        <span className="col-span-3">{formData.iceContactPhone}</span>
        <b>{text('Important Info:', 'Belangrijke info:')}</b>
        <span className="col-span-3">{formData.importantInfo}</span>
      </TextCard>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.consent}
            onChange={(e) => handleChange('consent', e.target.checked)}
          />
        }
        label={text(
          'I give permission to the NijSAC to save and process all personal data I enter on the site.',
          'Ik geef toestemming aan de NijSAC om alle persoonlijke informatie die ik invoer op de site op te slaan en te verwerken.'
        )}
      />
      <FormControls
        activeStep={4}
        handleBack={handleBack}
        handleNext={handleSubmit}
        validateInputs={validateInputs}
        consentGiven={formData.consent}
      />
    </>
  );
};