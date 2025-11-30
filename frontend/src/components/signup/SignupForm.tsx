import {useState} from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {MembershipStatus, UserContent} from '../../types.ts';
import PersonalStep from './PersonalStep.tsx';
import EducationStep from './EducationStep.tsx';
import EmergencyContactStep from './EmergencyContactStep.tsx';
import OverviewStep from './OverviewStep.tsx';
import {Control, useForm, UseFormRegister} from 'react-hook-form';
import FormControls from './FormControls.tsx';
import {useUsers} from '../../hooks/useUsers.ts';
import {useWebsite} from '../../hooks/useState.ts';

export type SignupFormForm = Omit<UserContent, 'roles'>;

export interface StepProps {
  control: Control<SignupFormForm>,
  register: UseFormRegister<SignupFormForm>,
}

const steps = [
  {id: 0, label: {en: 'Personal', nl: 'Persoonlijk'}},
  {id: 1, label: {en: 'Education & Insurance', nl: 'Educatie & Verzekering'}},
  {id: 2, label: {en: 'Emergency contact', nl: 'Contact noodgevallen'}},
  {id: 3, label: {en: 'Overview', nl: 'Overzicht'}}
];

export default function SignupForm({membershipType}: {
  membershipType: Omit<MembershipStatus, 'pending' | 'nonMember'>
}) {
  const {text} = useLanguage();
  const {signup} = useUsers();
  const {navigate} = useWebsite();
  const [activeStep, setActiveStep] = useState<number>(0);
  const {
    register,
    control,
    handleSubmit,
    getFieldState,
    trigger,
    getValues
  } = useForm<SignupFormForm>({
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      infix: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      importantInfo: '',
      studentNumber: '',
      nkbvNumber: '',
      sportcardNumber: '',
      iceContactName: '',
      iceContactEmail: '',
      iceContactPhone: '',
      status: membershipType as MembershipStatus,
    }
  });

  const stepErrorKeys: Record<number, (keyof SignupFormForm)[]> = {
    0: ['firstName', 'lastName', 'infix', 'phone', 'email', 'password', 'importantInfo'],
    1: ['studentNumber', 'sportcardNumber', 'nkbvNumber'],
    2: ['iceContactName', 'iceContactEmail', 'iceContactPhone'],
  };

  const handleNext = async () => {
    const keysToCheck = stepErrorKeys[activeStep] || [];
    await trigger(keysToCheck);
    for (const key of keysToCheck) {
      if (getFieldState(key).invalid) {
        return;
      }
    }
    if (activeStep === 3) {
      await handleSubmit(async newUser => {
        if (await signup(newUser)) {
          navigate('index');
        }
      })();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
    case 0:
      return <PersonalStep control={control} register={register}/>;
    case 1:
      return <EducationStep control={control} register={register}/>;
    case 2:
      return <EmergencyContactStep control={control} register={register}/>;
    case 3:
      return <OverviewStep getValues={getValues}/>;
    default:
      return null;
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

      <FormControls
        activeStep={activeStep}
        handleBack={handleBack}
        handleNext={handleNext}
      />
    </div>
  );
}