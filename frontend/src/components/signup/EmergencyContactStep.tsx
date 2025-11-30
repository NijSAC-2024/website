import { Box } from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {StepProps} from './SignupForm.tsx';
import {FormInputText} from '../form/FormInputText.tsx';

export default function EmergencyContactStep({
  register,
  control,
}: StepProps){
  const { text } = useLanguage()
  return (
    <Box className="grid gap-2.5">
      <FormInputText
        label={text('Emergency Contact Name', 'Naam contact noodgevallen')}
        {...register('iceContactName', {
          required: text('At least 2 characters', 'Minimaal 2 karakters'),
          minLength: {
            value: 2,
            message: text('At least 2 characters', 'Minimaal 2 karakters')
          },
          maxLength: {
            value: 20,
            message: text('At most 30 characters', 'Maximaal 30 karakters')
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputText
        label={text('Emergency Contact Email', 'E-mail contact noodgevallen')}
        {...register('iceContactEmail', {
          required: text('Invalid email address', 'Ongeldig e-mailadres'),
          pattern: {
            value: /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i,
            message: text('Invalid email address', 'Ongeldig e-mailadres')
          }
        })}
        type='email'
        control={control}
        size="medium"
      />

      <FormInputText
        label={text('Emergency Contact Phone', 'Telefoon contact noodgevallen')}
        {...register('iceContactPhone', {
          required: text('Invalid phone number', 'Ongeldig telefoonnummer'),
          pattern: {
            value: /^\+?[0-9\s-]{7,15}$/,
            message: text('Invalid phone number', 'Ongeldig telefoonnummer')
          }
        })}
        control={control}
        size="medium"
      />
    </Box>
  );
};