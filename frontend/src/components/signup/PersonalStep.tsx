import {Box, FormControl, FormHelperText, TextField} from '@mui/material';
import {StepProps} from '../../types.ts';
import FormControls from './FormControls.tsx';
import moment from 'moment/moment';
import {DatePicker} from '@mui/x-date-pickers';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import PasswordField from '../PasswordField.tsx';

export default function PersonalStep({
  formData,
  errors,
  handleChange,
  handleNext,
  handleBack,
  validateInputs,
}: StepProps) {
  const { text } = useLanguage()
  return (
    <Box className="grid lg:grid-cols-10 gap-y-4 gap-x-2.5" component="form" onSubmit={handleNext}>
      <FormControl className="lg:col-span-4">
        <TextField
          label={text('First Name', 'Voornaam')}
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          variant="outlined"
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
      </FormControl>

      <FormControl className="lg:col-span-2">
        <TextField
          label={text('Infix', 'Tussenvoegsel')}
          value={formData.infix}
          onChange={(e) => handleChange('infix', e.target.value)}
          variant="outlined"
          error={!!errors.infix}
          helperText={errors.infix}
        />
      </FormControl>

      <FormControl className="lg:col-span-4">
        <TextField
          label={text('Last Name', 'Achternaam')}
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          variant="outlined"
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </FormControl>

      <FormControl className="lg:col-span-10" error={!!errors.dateOfBirth}>
        <DatePicker
          label={text('Date of birth', 'Geboortedatum')}
          value={moment(formData.dateOfBirth)}
          onChange={(date) => handleChange('dateOfBirth', date!.toISOString())}
        />
        {errors.dateOfBirth && <FormHelperText>{errors.dateOfBirth}</FormHelperText>}
      </FormControl>

      <FormControl className="lg:col-span-5">
        <TextField
          label={text('Address', 'Adres')}
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          variant="outlined"
          error={!!errors.address}
          helperText={errors.address}
        />
      </FormControl>

      <FormControl className="lg:col-span-5">
        <TextField
          label={text('Postal code', 'Postcode')}
          value={formData.postalCodeCity}
          onChange={(e) => handleChange('postalCodeCity', e.target.value)}
          variant="outlined"
          error={!!errors.postalCodeCity}
          helperText={errors.postalCodeCity}
        />
      </FormControl>

      <FormControl className="lg:col-span-10">
        <TextField
          label={text('Phone', 'Telefoon')}
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          variant="outlined"
          error={!!errors.phone}
          helperText={errors.phone}
        />
      </FormControl>

      <FormControl className="lg:col-span-5">
        <TextField
          label={text('Email', 'E-mail')}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email}
        />
      </FormControl>

      <FormControl className="lg:col-span-5" error={!!errors.password}>
        <PasswordField
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          label={text('Password', 'Wachtwoord')}
        />
        {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
      </FormControl>

      <FormControl className="lg:col-span-10">
        <TextField
          multiline
          label={text('Important Info (allergies etc.)', 'Belangrijke info (allergieën etc.)')}
          value={formData.importantInfo}
          onChange={(e) => handleChange('importantInfo', e.target.value)}
          variant="outlined"
          error={!!errors.importantInfo}
          helperText={errors.importantInfo}
        />
      </FormControl>

      <div className="lg:col-span-10">
        <FormControls
          activeStep={0}
          handleBack={handleBack}
          handleNext={handleNext}
          validateInputs={validateInputs}
          consentGiven={false}
        />
      </div>
    </Box>
  );
};