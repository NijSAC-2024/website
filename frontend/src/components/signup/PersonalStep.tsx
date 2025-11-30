import {Box} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {StepProps} from './SignupForm.tsx';
import {FormInputText} from '../form/FormInputText.tsx';
import {FormInputPassword} from '../form/FormInputPassword.tsx';

export default function PersonalStep({
  register,
  control,
}: StepProps) {
  const {text} = useLanguage();
  return (
    <Box className="grid xl:grid-cols-10 gap-y-4 gap-x-2.5">
      <FormInputText
        className="xl:col-span-4"
        {...register('firstName', {
          required: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn'),
          minLength: {
            value: 2,
            message: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn')
          }
        })}
        control={control}
        label={text('First Name', 'Voornaam')}
        size="medium"
      />

      <FormInputText
        className="xl:col-span-2"
        label={text('Infix', 'Tussenvoegsel')}
        {...register('infix', {
          pattern: {
            value: /^[a-zA-Z\s'-]{0,15}$/,
            message: text(
              'Only letters, spaces, apostrophes, and hyphens are allowed',
              'Alleen letters, spaties, apostroffen en koppeltekens zijn toegestaan'
            )
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputText
        className="xl:col-span-4"
        label={text('Last Name', 'Achternaam')}
        {...register('lastName', {
          required: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn'),
          minLength: {
            value: 2,
            message: text('Name must be at least 2 characters long', 'Naam moet ten minste 2 karakters lang zijn')
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputText
        className="xl:col-span-10"
        label={text('Phone', 'Telefoon')}
        {...register('phone', {
          required: text('Invalid phone number', 'Ongeldig telefoonnummer'),
          pattern: {
            value: /^\+?[0-9\s-]{7,15}$/,
            message: text('Invalid phone number', 'Ongeldig telefoonnummer')
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputText
        className="xl:col-span-5"
        label={text('Email', 'E-mail')}
        {...register('email', {
          required: text('Invalid email address', 'Ongeldig e-mailadres'),
          pattern: {
            value: /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i,
            message: text('Invalid email address', 'Ongeldig e-mailadres')
          }
        })}
        control={control}
        size="medium"
      />

      <FormInputPassword
        className="xl:col-span-5"
        label={text('Password', 'Wachtwoord')}
        {...register('password', {
          required: text('Password must be at least 10 characters long', 'Wachtwoord moet minimaal 10 karakters lang zijn'),
          minLength: {
            value: 10,
            message: text('Password must be at least 10 characters long', 'Wachtwoord moet minimaal 10 karakters lang zijn')
          }
        })}
        size="medium"
        control={control}
      />

      <FormInputText
        className="xl:col-span-10"
        multiline
        minRows={2}
        label={text('Important Info (allergies etc.)', 'Belangrijke info (allergieën etc.)')}
        {...register('importantInfo', {
          maxLength: {
            value: 2000,
            message: text('At most 2000 characters', 'Maximaal 2000 karakters')
          }
        })}
        control={control}
        size="medium"
      />
    </Box>
  );
};