import {FormEvent, useState} from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {ErrorType, UserContent} from '../../types.ts';
import PersonalStep from './PersonalStep.tsx';
import EducationStep from './EducationStep.tsx';
import EmergencyContactStep from './EmergencyContactStep.tsx';
import OverviewStep from './OverviewStep.tsx';
import {
  emailValidator, emergencyContactNameValidator,
  nameValidator, onlyNumbersValidator,
  optionalOnlyLetterNumberValidator,
  optionalOnlyLetterValidator,
  passwordValidator,
  phoneValidator,
} from '../../validator.ts';

export interface StepProps {
  newUser: UserContent;
  errors: FormErrors;
  handleChange: (field: keyof UserContent, value: string | number) => void;
  handleNext: (e: FormEvent) => void;
  handleBack: () => void;
  handleSubmit: () => void;
  validateInputs: () => void;
}

interface FormErrors {
  firstName: ErrorType
  infix: ErrorType;
  lastName: ErrorType;
  phone: ErrorType;
  studentNumber: ErrorType;
  nkbvNumber: ErrorType;
  sportcardNumber: ErrorType;
  iceContactName: ErrorType;
  iceContactEmail: ErrorType;
  iceContactPhone: ErrorType;
  importantInfo: ErrorType;
  email: ErrorType;
  password: ErrorType;
}

const steps = [
  {id: 0, label: {en: 'Personal', nl: 'Persoonlijk' }},
  {id: 1, label: {en: 'Education & Insurance', nl: 'Educatie & Verzekering'}},
  {id: 2, label: {en: 'Emergency contact', nl: 'Contact noodgevallen'}},
  {id: 3, label: {en: 'Overview', nl: 'Overzicht'}}
];

interface SignupFormProps {
  newUser: UserContent;
  handleChange: (field: keyof UserContent, value: string | number) => void;
  handleSubmit: () => void;
}

export default function SignupForm({newUser, handleChange, handleSubmit}: SignupFormProps) {
  const { text } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);

  const [errors, setErrors] = useState<FormErrors>({
    firstName: false,
    infix: false,
    lastName: false,
    phone: false,
    email: false,
    password: false,
    studentNumber: false,
    sportcardNumber: false,
    nkbvNumber: false,
    iceContactName: false,
    iceContactEmail: false,
    iceContactPhone: false,
    importantInfo: false,
  });

  const stepErrorKeys: Record<number, (keyof typeof errors)[]> = {
    0: ['firstName', 'lastName', 'infix', 'phone', 'email', 'password', 'importantInfo'],
    1: ['studentNumber', 'sportcardNumber', 'nkbvNumber'],
    2: ['iceContactName', 'iceContactEmail', 'iceContactPhone'],
  };

  const handleNext = async (event: FormEvent) => {
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

  const validateInputs = () => {
    switch (activeStep) {
    case 0: {
      const firstNameError = nameValidator(newUser.firstName);
      const infixError = optionalOnlyLetterValidator(newUser.infix);
      const lastNameError = nameValidator(newUser.lastName);
      const phoneError = phoneValidator(newUser.phone);
      const emailError = emailValidator(newUser.email);
      const passwordError = passwordValidator(newUser.password);
      const importantInfoError = optionalOnlyLetterNumberValidator(newUser.importantInfo);
      setErrors({
        ...errors,
        firstName: firstNameError,
        infix: infixError,
        lastName: lastNameError,
        phone: phoneError,
        email: emailError,
        password: passwordError,
        importantInfo: importantInfoError
      });
      break;
    }
    case 1: {
      const studentNumberError = onlyNumbersValidator(newUser.studentNumber.toString());
      const sportcardNumberError = onlyNumbersValidator(newUser.sportcardNumber.toString());
      const nkbvNumberError = onlyNumbersValidator(newUser.nkbvNumber.toString());
      setErrors({
        ...errors,
        studentNumber: studentNumberError,
        sportcardNumber: sportcardNumberError,
        nkbvNumber: nkbvNumberError,
      });
      break;
    }
    case 2: {
      const iceContactNameError = emergencyContactNameValidator(newUser.iceContactName);
      const iceContactEmailError = emailValidator(newUser.iceContactEmail);
      const iceContactPhoneError = phoneValidator(newUser.iceContactPhone);
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
    newUser,
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
    case 2: return <EmergencyContactStep {...stepProps} />;
    case 3: return <OverviewStep {...stepProps} />;
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