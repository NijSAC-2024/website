import { ReactNode, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel } from '@mui/material';
import ValidatedPassword from '../ValidatedPassword.tsx';
import { enqueueSnackbar } from 'notistack';
import ValidatedTextField from '../ValidatedTextField.tsx';
import {
  emailValidator,
  nameValidator,
  passwordValidator,
  phoneValidator,
  dateValidator,
  educationalInstitutionValidator,
  ibanValidator,
  bicValidator,
  optionalValidatorLettersOnly,
  optionalValidatorLettersAndNumbers,
  optionalValidatorNumbersOnly,
  addressValidator,
  emergencyContactNameValidator, validatorLettersAndNumbers,
} from '../../validator.ts';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { apiFetch } from '../../api.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

const steps = [
  'Personal',
  'Education',
  'Financial',
  'Emergency contact',
  'Overview'
];

export default function SignupForm() {
  const { text } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);

  // Personal
  const [email, setEmail] = useState<string>('');
  const [firstName, setfirstName] = useState<string>('');
  const [infix, setInfix] = useState<string>(''); // optional
  const [lastName, setlastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [postalCodeCity, setPostalCodeCity] = useState<string>('');
  const [phone, setphone] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [importantInfo, setimportantInfo] = useState<string>('');
  
  // Education
  const [university, setUniversity] = useState<string>('');
  const [studentNumber, setstudentNumber] = useState<string>(''); // optional
  const [sportcardNumber, setsportcardNumber] = useState<string>(''); // optional
  const [nkbvNumber, setnkbvNumber] = useState<string>(''); // not optional, info field for e.g DAV

  // Financial
  const [iban, setIban] = useState<string>('');
  const [bic, setBic] = useState<string>('');

  // Emergency contact
  const [iceContactName, seticeContactName] = useState<string>('');
  const [iceContactPhone, seticeContactPhone] = useState<string>('');

  // Overview
  const [consentGiven, setConsentGiven] = useState<boolean>(false);

  const formValid = useRef({
    email: false,
    firstName: false,
    infix: false,
    lastName: false,
    password: false,
    address: false,
    postalCodeCity: false,
    phone: false,
    dateOfBirth: false,
    importantInfo: false,
    university: false,
    studentNumber: false,
    sportcardNumber: false,
    nkbvNumber: false,
    iban: false,
    bic: false,
    iceContactName: false,
    iceContactPhone: false,
    consentGiven: false
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (Object.values(formValid.current).some((isValid) => !isValid)) {
      enqueueSnackbar('Please fill in all fields correctly.', {
        variant: 'error'
      });
      return;
    }

    const { error } = await apiFetch<void>('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        infix,
        lastName,
        password,
        status: 'pending',
        email,
        phone,
        dateOfBirth,
        studentNumber: studentNumber ? parseInt(studentNumber, 10) : null,
        //address
        //postcalcode and city
        sportcardNumber: sportcardNumber ? parseInt(sportcardNumber, 10) : null,
        nkbvNumber: nkbvNumber ? parseInt(nkbvNumber, 10) : null,
        // iban,
        // bic,
        iceContactName,
        iceContactPhone,
        importantInfo,
        // University
        // Consent
      })
    });

    if (error) {
      switch (error.message) {
      case 'Conflict':
        enqueueSnackbar('Email is already in use.', {
          variant: 'error'
        });
        break;
      default:
        enqueueSnackbar(`${error.message}: ${error.reference}`, {
          variant: 'error'
        });
      }
      return;
    }

    enqueueSnackbar(`Created account: ${firstName} ${lastName}`, {
      variant: 'success'
    });
  };




  function renderStepContent() {
    switch (activeStep) {
    case 0:
      return (
        <>
          <ValidatedTextField
            label={text('First Name', 'Voornaam')}
            validator={nameValidator}
            onChange={(isValid) => {
              formValid.current.firstName = isValid;
              console.log('firstName valid:', isValid);
            }}
            setValue={setfirstName}
            value={firstName}
          />
          <ValidatedTextField
            label={text('Infix', 'Tussenvoegsel')}
            validator={optionalValidatorLettersOnly}
            onChange={(isValid) => (formValid.current.infix = isValid)}
            setValue={setInfix}
            value={infix}
          />
          <ValidatedTextField
            label={text('Last Name', 'Achternaam')}
            validator={nameValidator}
            onChange={(isValid) => (formValid.current.lastName = isValid)}
            setValue={setlastName}
            value={lastName}
          />
          <ValidatedTextField
            label={text('Date of birth', 'Geboortedatum')}
            validator={dateValidator}
            onChange={(isValid) => (formValid.current.dateOfBirth = isValid)}
            setValue={setDateOfBirth}
            value={dateOfBirth}
          />
          <ValidatedTextField
            label={text('Address', 'Adres')}
            validator={addressValidator}
            onChange={(isValid) => (formValid.current.address = isValid)}
            setValue={setAddress}
            value={address}
          />
          <ValidatedTextField
            label={text('Postal code', 'Postcode')}
            validator={validatorLettersAndNumbers}
            onChange={(isValid) => (formValid.current.postalCodeCity = isValid)}
            setValue={setPostalCodeCity}
            value={postalCodeCity}
          />
          <ValidatedTextField
            label={text('Phone', 'Telefoon')}
            validator={phoneValidator}
            onChange={(isValid) => (formValid.current.phone = isValid)}
            setValue={setphone}
            value={phone}
          />
          <ValidatedTextField
            label={text('Email', 'E-mail')}
            validator={emailValidator}
            onChange={(isValid) => (formValid.current.email = isValid)}
            setValue={setEmail}
            value={email}
          />
          <ValidatedPassword
            label={text('Password', 'Wachtwoord')}
            validator={passwordValidator}
            onChange={(isValid) => (formValid.current.password = isValid)}
            setValue={setPassword}
            value={password}
          />
        </>
      );
    case 1:
      return (
        <>
          <ValidatedTextField
            label={text('Educational Institution', 'Onderwijsinstelling')}
            validator={educationalInstitutionValidator}
            onChange={(isValid) => (formValid.current.university = isValid)}
            setValue={setUniversity}
            value={university}
          />
          <ValidatedTextField
            label={text('Student Number', 'Studentnummer')}
            validator={optionalValidatorNumbersOnly}
            onChange={(isValid) => (formValid.current.studentNumber = isValid)}
            setValue={setstudentNumber}
            value={studentNumber}
          />
          <ValidatedTextField
            label={text('Sportcard Number', 'Sportkaartnummer')}
            validator={optionalValidatorNumbersOnly}
            onChange={(isValid) => (formValid.current.sportcardNumber = isValid)}
            setValue={setsportcardNumber}
            value={sportcardNumber}
          />
          <ValidatedTextField
            label={text('NKBV Number', 'NKBV-nummer')}
            validator={optionalValidatorNumbersOnly}
            onChange={(isValid) => (formValid.current.nkbvNumber = isValid)}
            setValue={setnkbvNumber}
            value={nkbvNumber}
          />
        </>
      );
    case 2:
      return (
        <>
          <ValidatedTextField
            label={text('IBAN', 'IBAN')}
            validator={ibanValidator}
            onChange={(isValid) => (formValid.current.iban = isValid)}
            setValue={setIban}
            value={iban}
          />
          <ValidatedTextField
            label={text('BIC', 'BIC')}
            validator={bicValidator}
            onChange={(isValid) => (formValid.current.bic = isValid)}
            setValue={setBic}
            value={bic}
          />
        </>
      );
    case 3:
      return (
        <>
          <ValidatedTextField
            label={text('Emergency Contact Name', 'Naam noodgevalcontact')}
            validator={emergencyContactNameValidator}
            onChange={(isValid) => (formValid.current.iceContactName = isValid)}
            setValue={seticeContactName}
            value={iceContactName}
          />
          <ValidatedTextField
            label={text('Emergency Contact Phone', 'Telefoon noodgevalcontact')}
            validator={phoneValidator}
            onChange={(isValid) => (formValid.current.iceContactPhone = isValid)}
            setValue={seticeContactPhone}
            value={iceContactPhone}
          />
          <ValidatedTextField
            label={text('Important Info (allergies etc.)', 'Belangrijke info (allergieën etc.)')}
            validator={optionalValidatorLettersAndNumbers}
            onChange={(isValid) => (formValid.current.importantInfo = isValid)}
            setValue={setimportantInfo}
            value={importantInfo}
          />
        </>
      );
    case 4:
      return (
        <>
          <p>{text('Please confirm that all entered data is correct.', 'Bevestig dat alle ingevulde gegevens kloppen.')}</p>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{text('First Name:', 'Voornaam:')}</strong> {firstName}<br />
            <strong>{text('Infix:', 'Tussenvoegsel:')}</strong> {infix || '-'}<br />
            <strong>{text('Last Name:', 'Achternaam:')}</strong> {lastName}<br />
            <strong>{text('Date of Birth:', 'Geboortedatum:')}</strong> {dateOfBirth}<br />
            <strong>{text('Address:', 'Adres:')}</strong> {address}<br />
            <strong>{text('Postal Code:', 'Postcode:')}</strong> {postalCodeCity}<br />
            <strong>{text('Phone:', 'Telefoon:')}</strong> {phone}<br />
            <strong>{text('Email:', 'E-mail:')}</strong> {email}<br />
            <strong>{text('Educational Institution:', 'Onderwijsinstelling:')}</strong> {university}<br />
            <strong>{text('Student Number:', 'Studentnummer:')}</strong> {studentNumber || '-'}<br />
            <strong>{text('Sportcard Number:', 'Sportkaartnummer:')}</strong> {sportcardNumber || '-'}<br />
            <strong>{text('NKBV Number:', 'NKBV-nummer:')}</strong> {nkbvNumber || '-'}<br />
            <strong>{text('IBAN:', 'IBAN:')}</strong> {iban}<br />
            <strong>{text('BIC:', 'BIC:')}</strong> {bic}<br />
            <strong>{text('Emergency Contact Name:', 'Naam noodgevalcontact:')}</strong> {iceContactName}<br />
            <strong>{text('Emergency Contact Phone:', 'Telefoon noodgevalcontact:')}</strong> {iceContactPhone}<br />
            <strong>{text('Important Info:', 'Belangrijke info:')}</strong> {importantInfo || '-'}
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={consentGiven}
                onChange={(e) => {
                  setConsentGiven(e.target.checked);
                  formValid.current.consentGiven = e.target.checked;
                }}
              />
            }
            label={text(
              'I give permission to the NijSAC to save and process all personal data I enter on the site.',
              'Ik geef toestemming aan de NijSAC om alle persoonlijke informatie die ik invoer op de site op te slaan en te verwerken.'
            )}
          />
        </>
      );
    default:
      return null;
    }
  }


  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        <Stepper alternativeLabel activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: ReactNode } = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Render fields based on current step */}
        {renderStepContent()}

        <div className="flex justify-between">
          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formValid.current.consentGiven}
            >
              Signup
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>
    </>
  );

}
