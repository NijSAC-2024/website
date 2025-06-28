import TextCard from '../TextCard.tsx';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {StepProps} from './SignupForm.tsx';

export default function OverviewStep({
  newUser,
  handleBack,
  handleSubmit,
  validateInputs,
}: StepProps) {
  const { text } = useLanguage()
  return (
    <>
      <p>{text('Please confirm that all entered data is correct.', 'Bevestig dat alle ingevulde gegevens kloppen.')}</p>
      <TextCard className="px-6 py-5 mt-3 grid grid-cols-4 gap-5">
        <b>{text('First name:', 'Voornaam:')}</b>
        <span className="col-span-3">{newUser.firstName}</span>
        <b>{text('Infix:', 'Tussenvoegsel:')}</b>
        <span className="col-span-3">{newUser.infix || '-'}</span>
        <b>{text('Last name:', 'Achternaam:')}</b>
        <span className="col-span-3">{newUser.lastName}</span>
        <b>{text('Phone:', 'Telefoon:')}</b>
        <span className="col-span-3">{newUser.phone}</span>
        <b>{text('Email:', 'E-mail:')}</b>
        <span className="col-span-3">{newUser.email}</span>
        <b>{text('Important info:', 'Belangrijke info:')}</b>
        <span className="col-span-3">{newUser.importantInfo || '-'}</span>

        <b>{text('Student number:', 'Studentnummer:')}</b>
        <span className="col-span-3">{newUser.studentNumber}</span>
        <b>{text('Sportcard number:', 'Sportkaartnummer:')}</b>
        <span className="col-span-3">{newUser.sportcardNumber}</span>
        <b>{text('NKBV number:', 'NKBV-nummer:')}</b>
        <span className="col-span-3">{newUser.nkbvNumber}</span>

        <b>{text('Emergency contact name:', 'Naam contact noodgevallen:')}</b>
        <span className="col-span-3">{newUser.iceContactName}</span>
        <b>{text('Emergency contact email:', 'E-mail contact noodgevallen:')}</b>
        <span className="col-span-3">{newUser.iceContactName}</span>
        <b>{text('Emergency contact phone:', 'Telefoon noodgevalcontact:')}</b>
        <span className="col-span-3">{newUser.iceContactPhone}</span>
      </TextCard>
      <FormControls
        activeStep={3}
        handleBack={handleBack}
        handleNext={handleSubmit}
        validateInputs={validateInputs}
      />
    </>
  );
};