import React, { useState } from 'react';
import {Box, Button, Checkbox, FormControl, FormControlLabel, TextField} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
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
  emergencyContactNameValidator,
  validatorLettersAndNumbers,
} from '../../validator.ts';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { apiFetch } from '../../api.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import TextCard from '../TextCard.tsx';
import { ErrorType } from '../../types.ts';

const steps = [
  {id: 0, label: {en: 'Personal', nl: 'Persoonlijk' }},
  {id: 1, label: {en: 'Education', nl: 'Educatie'}},
  {id: 2, label: {en: 'Financial', nl: 'Financieel'}},
  {id: 3, label: {en: 'Emergency contact', nl: 'Contact voor noodgevallen'}},
  {id: 4, label: {en: 'Overview', nl: 'Overzicht'}}
];

export default function SignupForm() {
  const { text } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);

  // Personal
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [infix, setInfix] = useState<string>(''); // optional
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [postalCodeCity, setPostalCodeCity] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [importantInfo, setImportantInfo] = useState<string>('');
  
  // Education
  const [university, setUniversity] = useState<string>('');
  const [studentNumber, setStudentNumber] = useState<string>(''); // optional
  const [sportcardNumber, setSportcardNumber] = useState<string>(''); // optional
  const [nkbvNumber, setNkbvNumber] = useState<string>(''); // not optional, info field for e.g DAV

  // Financial
  const [iban, setIban] = useState<string>('');
  const [bic, setBic] = useState<string>('');

  // Emergency contact
  const [iceContactName, seticeContactName] = useState<string>('');
  const [iceContactPhone, seticeContactPhone] = useState<string>('');

  // Overview
  const [consentGiven, setConsentGiven] = useState<boolean>(false);

  const [error, setError] = useState<ErrorType>({
    firstName: false,
    infix: false,
    lastName: false,
    dateOfBirth: false,
    address: false,
    postalCodeCity: false,
    phone: false,
    email: false,
    password: false,
    university: false,
    studentNumber: false,
    sportcardNumber: false,
    nkbvNumber: false,
    iban: false,
    bic: false,
    iceContactName: false,
    iceContactPhone: false, 
    importantInfo: false,
  });

  const stepErrorKeys: Record<number, (keyof typeof error)[]> = {
    0: ['firstName', 'lastName', 'infix', 'dateOfBirth', 'address', 'phone', 'email', 'password'],
    1: ['university', 'studentNumber', 'sportcardNumber', 'nkbvNumber'],
    2: ['iban', 'bic'],
    3: ['iceContactName', 'iceContactPhone', 'importantInfo'],
  };

  const validateInputs = () => {
    switch (activeStep) {
    case 0: {
      const firstNameError = nameValidator(firstName);
      const infixError = optionalValidatorLettersOnly(infix);
      const lastNameError = nameValidator(lastName);
      const dateOfBirthError = dateValidator(dateOfBirth);
      const addressError = addressValidator(address);
      const postalCodeCityError = validatorLettersAndNumbers(postalCodeCity);
      const phoneError = phoneValidator(phone);
      const emailError = emailValidator(email);
      const passwordError = passwordValidator(password);
      const importantInfoError = optionalValidatorLettersAndNumbers(importantInfo);
      setError({
        ...error,
        firstName: firstNameError,
        infix: infixError,
        lastName: lastNameError,
        dateOfBirth: dateOfBirthError,
        address: addressError,
        postalCodeCity: postalCodeCityError,
        phone: phoneError,
        email: emailError,
        password: passwordError,
        importantInfo: importantInfoError
      });
      break;
    }
    case 1: {
      const universityError = educationalInstitutionValidator(university);
      const studentNumberError = optionalValidatorNumbersOnly(studentNumber);
      const sportcardNumberError = optionalValidatorNumbersOnly(sportcardNumber);
      const nkbvNumberError = optionalValidatorNumbersOnly(nkbvNumber);
      setError({
        ...error,
        university: universityError,
        studentNumber: studentNumberError,
        sportcardNumber: sportcardNumberError,
        nkbvNumber: nkbvNumberError
      });
      break;
    }
    case 2: {
      const ibanError = ibanValidator(iban);
      const bicError = bicValidator(bic);
      setError({
        ...error,
        iban: ibanError,
        bic: bicError
      });
      break;
    }
    case 3: {
      const iceContactNameError = emergencyContactNameValidator(iceContactName);
      const iceContactPhoneError = phoneValidator(iceContactPhone);
      setError({
        ...error,
        iceContactName: iceContactNameError,
        iceContactPhone: iceContactPhoneError,
      });
      break;
    }
    default:
      break;
    }
  };

  const handleNext = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keysToCheck = stepErrorKeys[activeStep] || [];
    if (keysToCheck.some((key) => error[key])) {
      console.log('returned');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
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
  
  const renderControls = () => {
    return (
      <div className="flex justify-between">
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!consentGiven}
          >
            Signup
          </Button>
        ) : (
          <Button type="submit" onClick={validateInputs}>Next</Button>
        )}
      </div>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
    case 0:
      return (
        <Box className="grid gap-2.5" component="form" onSubmit={handleNext}>
          <FormControl>
            <TextField
              label={text('First Name', 'Voornaam')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
              error={!!error.firstName}
              helperText={error.firstName}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Infix', 'Tussenvoegsel')}
              value={infix}
              onChange={(e) => setInfix(e.target.value)}
              variant="outlined"
              error={!!error.infix}
              helperText={error.infix}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Last Name', 'Achternaam')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
              error={!!error.lastName}
              helperText={error.lastName}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Date of birth', 'Geboortedatum')}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              variant="outlined"
              error={!!error.dateOfBirth}
              helperText={error.dateOfBirth}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Address', 'Adres')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              variant="outlined"
              error={!!error.address}
              helperText={error.address}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Postal code', 'Postcode')}
              value={postalCodeCity}
              onChange={(e) => setPostalCodeCity(e.target.value)}
              variant="outlined"
              error={!!error.postalCodeCity}
              helperText={error.postalCodeCity}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Phone', 'Telefoon')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="outlined"
              error={!!error.phone}
              helperText={error.phone}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Email', 'E-mail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              error={!!error.email}
              helperText={error.email}
            />
          </FormControl>

          <FormControl>
            <TextField
              type="password"
              label={text('Password', 'Wachtwoord')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              error={!!error.password}
              helperText={error.password}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Important Info (allergies etc.)', 'Belangrijke info (allergieën etc.)')}
              value={importantInfo}
              onChange={(e) => setImportantInfo(e.target.value)}
              variant="outlined"
              error={!!error.importantInfo}
              helperText={error.importantInfo}
            />
          </FormControl>

          {renderControls()}
        </Box>
      );
    case 1:
      return (
        <Box className="grid gap-2.5" component="form" onSubmit={handleNext}>
          <FormControl>
            <TextField
              label={text('Educational Institution', 'Onderwijsinstelling')}
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              variant="outlined"
              error={!!error.university}
              helperText={error.university}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Student Number', 'Studentnummer')}
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              variant="outlined"
              error={!!error.studentNumber}
              helperText={error.studentNumber}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Sportcard Number', 'Sportkaartnummer')}
              value={sportcardNumber}
              onChange={(e) => setSportcardNumber(e.target.value)}
              variant="outlined"
              error={!!error.sportcardNumber}
              helperText={error.sportcardNumber}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('NKBV Number', 'NKBV-nummer')}
              value={nkbvNumber}
              onChange={(e) => setNkbvNumber(e.target.value)}
              variant="outlined"
              error={!!error.nkbvNumber}
              helperText={error.nkbvNumber}
            />
          </FormControl>

          {renderControls()}
        </Box>

      );
    case 2:
      return (
        <Box className="grid gap-2.5" component="form" onSubmit={handleNext}>
          <FormControl>
            <TextField
              label={text('IBAN', 'IBAN')}
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              variant="outlined"
              error={!!error.iban}
              helperText={error.iban}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('BIC', 'BIC')}
              value={bic}
              onChange={(e) => setBic(e.target.value)}
              variant="outlined"
              error={!!error.bic}
              helperText={error.bic}
            />
          </FormControl>

          {renderControls()}
        </Box>
      );
    case 3:
      return (
        <Box className="grid gap-2.5" component="form" onSubmit={handleNext}>
          <FormControl>
            <TextField
              label={text('Emergency Contact Name', 'Naam noodgevalcontact')}
              value={iceContactName}
              onChange={(e) => seticeContactName(e.target.value)}
              variant="outlined"
              error={!!error.iceContactName}
              helperText={error.iceContactName}
            />
          </FormControl>

          <FormControl>
            <TextField
              label={text('Emergency Contact Phone', 'Telefoon noodgevalcontact')}
              value={iceContactPhone}
              onChange={(e) => seticeContactPhone(e.target.value)}
              variant="outlined"
              error={!!error.iceContactPhone}
              helperText={error.iceContactPhone}
            />
          </FormControl>

          {renderControls()}
        </Box>
      );
    case 4:
      return (
        <>
          <p>{text('Please confirm that all entered data is correct.', 'Bevestig dat alle ingevulde gegevens kloppen.')}</p>
          <TextCard className="px-6 py-5 mt-3 grid grid-cols-4 gap-5">
            <b>{text('First Name:', 'Voornaam:')}</b>
            <span className="col-span-3">{firstName || '-' }</span>
            <b>{text('Infix:', 'Tussenvoegsel:')}</b>
            <span className="col-span-3">{infix || '-' }</span>
            <b>{text('Last Name:', 'Achternaam:')}</b>
            <span className="col-span-3">{lastName || '-' }</span>
            <b>{text('Date of Birth:', 'Geboortedatum:')}</b>
            <span className="col-span-3">{dateOfBirth || '-' }</span>
            <b>{text('Address:', 'Adres:')}</b>
            <span className="col-span-3">{address || '-' }</span>
            <b>{text('Postal Code:', 'Postcode:')}</b>
            <span className="col-span-3">{postalCodeCity || '-' }</span>
            <b>{text('Phone:', 'Telefoon:')}</b>
            <span className="col-span-3">{phone || '-' }</span>
            <b>{text('Email:', 'E-mail:')}</b>
            <span className="col-span-3">{email || '-' }</span>

            <b>{text('Educational Institution:', 'Onderwijsinstelling:')}</b>
            <span className="col-span-3">{university || '-' }</span>
            <b>{text('Student Number:', 'Studentnummer:')}</b>
            <span className="col-span-3">{studentNumber || '-' }</span>
            <b>{text('Sportcard Number:', 'Sportkaartnummer:')}</b>
            <span className="col-span-3">{sportcardNumber || '-' }</span>
            <b>{text('NKBV Number:', 'NKBV-nummer:')}</b>
            <span className="col-span-3">{nkbvNumber || '-' }</span>

            <b>{text('IBAN:', 'IBAN:')}</b>
            <span className="col-span-3">{iban || '-' }</span>
            <b>{text('BIC:', 'BIC:')}</b>
            <span className="col-span-3">{bic || '-' }</span>

            <b>{text('Emergency Contact Name:', 'Naam noodgevalcontact:')}</b>
            <span className="col-span-3">{iceContactName || '-' }</span>
            <b>{text('Emergency Contact Phone:', 'Telefoon noodgevalcontact:')}</b>
            <span className="col-span-3">{iceContactPhone || '-' }</span>
            <b>{text('Important Info:', 'Belangrijke info:')}</b>
            <span className="col-span-3">{importantInfo || '-' }</span>
          </TextCard>
          <FormControlLabel
            control={
              <Checkbox
                checked={consentGiven}
                onChange={(e) => {
                  setConsentGiven(e.target.checked);
                }}
              />
            }
            label={text(
              'I give permission to the NijSAC to save and process all personal data I enter on the site.',
              'Ik geef toestemming aan de NijSAC om alle persoonlijke informatie die ik invoer op de site op te slaan en te verwerken.'
            )}
          />
          {renderControls()}
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
            return (
              <Step className={activeStep > label.id ? 'cursor-pointer': ''} key={label.id} {...stepProps} onClick={() => activeStep > label.id && setActiveStep(label.id)}>
                <StepLabel>{text(label.label)}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Render fields based on current[activeStep] step */}
        {renderStepContent()}
      </div>
    </>
  );

}
