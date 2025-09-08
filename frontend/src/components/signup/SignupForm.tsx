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

export interface FormErrors {
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
      setErrors({
        ...errors,
        firstName: nameValidator(newUser.firstName),
        infix: optionalOnlyLetterValidator(newUser.infix),
        lastName: nameValidator(newUser.lastName),
        phone: phoneValidator(newUser.phone),
        email: emailValidator(newUser.email),
        password: passwordValidator(newUser.password),
        importantInfo: optionalOnlyLetterNumberValidator(newUser.importantInfo)
      });
      break;
    }
    case 1: {
      setErrors({
        ...errors,
        studentNumber: onlyNumbersValidator(newUser.studentNumber.toString()),
        sportcardNumber: onlyNumbersValidator(newUser.sportcardNumber.toString()),
        nkbvNumber: onlyNumbersValidator(newUser.nkbvNumber.toString())
      });
      break;
    }
    case 2: {
      setErrors({
        ...errors,
        iceContactName: emergencyContactNameValidator(newUser.iceContactName),
        iceContactEmail: emailValidator(newUser.iceContactEmail),
        iceContactPhone: phoneValidator(newUser.iceContactPhone)
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