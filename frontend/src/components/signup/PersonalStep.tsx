import {Box, FormControl, FormHelperText, TextField} from '@mui/material';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import PasswordField from '../PasswordField.tsx';
import { StepProps } from './SignupForm.tsx';
import {Language} from '../../types.ts';

export default function PersonalStep({
  newUser,
  errors,
  handleChange,
  handleNext,
  handleBack,
  validateInputs,
}: StepProps) {
  const { text } = useLanguage()
  return (
    <Box className="grid xl:grid-cols-10 gap-y-4 gap-x-2.5" component="form" onSubmit={handleNext}>
      <FormControl className="xl:col-span-4">
        <TextField
          label={text('First Name', 'Voornaam')}
          value={newUser.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          variant="outlined"
          error={!!errors.firstName}
          helperText={errors.firstName && text(errors.firstName as Language)}
        />
      </FormControl>

      <FormControl className="xl:col-span-2">
        <TextField
          label={text('Infix', 'Tussenvoegsel')}
          value={newUser.infix}
          onChange={(e) => handleChange('infix', e.target.value)}
          variant="outlined"
          error={!!errors.infix}
          helperText={errors.infix && text(errors.infix as Language)}
        />
      </FormControl>

      <FormControl className="xl:col-span-4">
        <TextField
          label={text('Last Name', 'Achternaam')}
          value={newUser.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          variant="outlined"
          error={!!errors.lastName}
          helperText={errors.lastName && text(errors.lastName as Language)}
        />
      </FormControl>

      <FormControl className="xl:col-span-10">
        <TextField
          label={text('Phone', 'Telefoon')}
          value={newUser.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          variant="outlined"
          error={!!errors.phone}
          helperText={errors.phone && text(errors.phone as Language)}
        />
      </FormControl>

      <FormControl className="xl:col-span-5">
        <TextField
          label={text('Email', 'E-mail')}
          value={newUser.email}
          onChange={(e) => handleChange('email', e.target.value)}
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email && text(errors.email as Language)}
        />
      </FormControl>

      <FormControl className="xl:col-span-5" error={!!errors.password}>
        <PasswordField
          value={newUser.password!}
          onChange={(e) => handleChange('password', e.target.value)}
          label={text('Password', 'Wachtwoord')}
        />
        {errors.password && <FormHelperText>{text(errors.password as Language)}</FormHelperText>}
      </FormControl>

      <FormControl className="xl:col-span-10">
        <TextField
          multiline
          label={text('Important Info (allergies etc.)', 'Belangrijke info (allergieën etc.)')}
          value={newUser.importantInfo}
          onChange={(e) => handleChange('importantInfo', e.target.value)}
          variant="outlined"
          error={!!errors.importantInfo}
          helperText={errors.importantInfo && text(errors.importantInfo as Language)}
        />
      </FormControl>

      <div className="xl:col-span-10">
        <FormControls
          activeStep={0}
          handleBack={handleBack}
          handleNext={handleNext}
          validateInputs={validateInputs}
        />
      </div>
    </Box>
  );
};