import React, { useState } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {FormErrors, FormUser, StepProps} from '../../types.ts';
import PersonalStep from './PersonalStep.tsx';
import EducationStep from './EducationStep.tsx';
import FinancialStep from './FinancialStep.tsx';
import EmergencyContactStep from './EmergencyContactStep.tsx';
import OverviewStep from './OverviewStep.tsx';
import {
  addressValidator,
  bicValidator,
  dateValidator,
  educationalInstitutionValidator,
  emailValidator, emergencyContactNameValidator,
  ibanValidator,
  nameValidator,
  optionalValidatorLettersAndNumbers,
  optionalValidatorLettersOnly,
  optionalValidatorNumbersOnly,
  passwordValidator,
  phoneValidator,
  validatorLettersAndNumbers
} from '../../validator.ts';
import {useApiState} from '../../providers/ApiProvider.tsx';

const steps = [
  {id: 0, label: {en: 'Personal', nl: 'Persoonlijk' }},
  {id: 1, label: {en: 'Education', nl: 'Educatie'}},
  {id: 2, label: {en: 'Financial', nl: 'Financieel'}},
  {id: 3, label: {en: 'Emergency contact', nl: 'Contact voor noodgevallen'}},
  {id: 4, label: {en: 'Overview', nl: 'Overzicht'}}
];

interface SignupFormProps {
  formData: FormUser;
  handleChange: (field: keyof FormUser, value: string | boolean) => void;
}

export default function SignupForm({formData, handleChange}: SignupFormProps) {
  const { text } = useLanguage();
  const { createUser } = useApiState()
  const [activeStep, setActiveStep] = useState<number>(0);

  const [errors, setErrors] = useState<FormErrors>({
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
    iceContactEmail: false,
    iceContactPhone: false,
    importantInfo: false,
  });

  const stepErrorKeys: Record<number, (keyof typeof errors)[]> = {
    0: ['firstName', 'lastName', 'infix', 'dateOfBirth', 'address', 'phone', 'email', 'password', 'importantInfo'],
    1: ['university', 'studentNumber', 'sportcardNumber', 'nkbvNumber'],
    2: ['iban', 'bic'],
    3: ['iceContactName', 'iceContactEmail', 'iceContactPhone'],
  };

  const handleNext = async (event: React.FormEvent) => {
    event.preventDefault();
    const keysToCheck = stepErrorKeys[activeStep] || [];
    if (keysToCheck.some((key) => errors[key])) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    createUser(formData);
  };

  const validateInputs = () => {
    switch (activeStep) {
    case 0: {
      const firstNameError = nameValidator(formData.firstName);
      const infixError = optionalValidatorLettersOnly(formData.infix);
      const lastNameError = nameValidator(formData.lastName);
      const dateOfBirthError = dateValidator(formData.dateOfBirth);
      const addressError = addressValidator(formData.address);
      const postalCodeCityError = validatorLettersAndNumbers(formData.postalCodeCity);
      const phoneError = phoneValidator(formData.phone);
      const emailError = emailValidator(formData.email);
      const passwordError = passwordValidator(formData.password);
      const importantInfoError = optionalValidatorLettersAndNumbers(formData.importantInfo);
      setErrors({
        ...errors,
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
      const universityError = educationalInstitutionValidator(formData.university);
      const studentNumberError = optionalValidatorNumbersOnly(formData.studentNumber);
      const sportcardNumberError = optionalValidatorNumbersOnly(formData.sportcardNumber);
      const nkbvNumberError = optionalValidatorNumbersOnly(formData.nkbvNumber);
      setErrors({
        ...errors,
        university: universityError,
        studentNumber: studentNumberError,
        sportcardNumber: sportcardNumberError,
        nkbvNumber: nkbvNumberError
      });
      break;
    }
    case 2: {
      const ibanError = ibanValidator(formData.iban);
      const bicError = bicValidator(formData.bic);
      setErrors({
        ...errors,
        iban: ibanError,
        bic: bicError
      });
      break;
    }
    case 3: {
      const iceContactNameError = emergencyContactNameValidator(formData.iceContactName);
      const iceContactEmailError = emailValidator(formData.iceContactEmail);
      const iceContactPhoneError = phoneValidator(formData.iceContactPhone);
      setErrors({
        ...errors,
        iceContactName: iceContactNameError,
        iceContactEmail: iceContactEmailError,
        iceContactPhone: iceContactPhoneError,
      });
      break;
    }
    default:
      break;
    }
  };

  const stepProps: StepProps = {
    formData,
    errors,
    handleChange,
    handleNext,
    handleBack,
    handleSubmit,
    validateInputs,
  };

  const renderStepContent = () => {
    switch (activeStep) {
    case 0: return <PersonalStep {...stepProps} />;
    case 1: return <EducationStep {...stepProps} />;
    case 2: return <FinancialStep {...stepProps} />;
    case 3: return <EmergencyContactStep {...stepProps} />;
    case 4: return <OverviewStep {...stepProps} />;
    default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((label) => (
          <Step
            className={activeStep > label.id ? 'cursor-pointer' : ''}
            key={label.id}
            onClick={() => activeStep > label.id && setActiveStep(label.id)}
          >
            <StepLabel>{text(label.label)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}
    </div>
  );
}