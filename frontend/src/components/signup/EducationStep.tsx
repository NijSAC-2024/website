import {Box} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {StepProps} from './SignupForm.tsx';
import {FormInputText} from '../form/FormInputText.tsx';

export default function EducationStep({
  register,
  control,
}: StepProps) {
  const {text} = useLanguage();
  return (
    <Box className="grid xl:grid-cols-2 gap-y-4 gap-x-2.5">
      <FormInputText
        label={text('Student Number', 'Studentnummer')}
        {...register('studentNumber', {
          required: text('At least 5 characters', 'Minimaal 5 karakters'),
          minLength: {
            value: 5,
            message: text('At least 5 characters', 'Minimaal 5 karakters')
          },
          maxLength: {
            value: 20,
            message: text('At most 20 characters', 'Maximaal 20 karakters')
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputText
        label={text('Sportcard Number', 'Sportkaartnummer')}
        {...register('sportcardNumber', {
          required: text('At least 5 characters', 'Minimaal 5 karakters'),
          minLength: {
            value: 5,
            message: text('At least 5 characters', 'Minimaal 5 karakters')
          },
          maxLength: {
            value: 20,
            message: text('At most 20 characters', 'Maximaal 20 karakters')
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputText
        className="xl:col-span-2"
        label={text('NKBV Number', 'NKBV-nummer')}
        {...register('nkbvNumber', {
          required: text('At least 5 characters', 'Minimaal 5 karakters'),
          minLength: {
            value: 5,
            message: text('At least 5 characters', 'Minimaal 5 karakters')
          },
          maxLength: {
            value: 20,
            message: text('At most 20 characters', 'Maximaal 20 karakters')
          }
        })}
        control={control}
        size="medium"
      />
    </Box>
  );
};