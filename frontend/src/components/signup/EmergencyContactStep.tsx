import { Box, FormControl, TextField } from '@mui/material';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {StepProps} from './SignupForm.tsx';
import {Language} from '../../types.ts';

export default function EmergencyContactStep({
  newUser,
  errors,
  handleChange,
  handleNext,
  handleBack,
  validateInputs,
}: StepProps){
  const { text } = useLanguage()
  return (
    <Box className="grid gap-2.5" component="form" onSubmit={handleNext}>
      <FormControl>
        <TextField
          label={text('Emergency contact name', 'Naam contact noodgevallen')}
          value={newUser.iceContactName}
          onChange={(e) => handleChange('iceContactName', e.target.value)}
          variant="outlined"
          error={!!errors.iceContactName}
          helperText={errors.iceContactName && text(errors.iceContactName as Language)}
        />
      </FormControl>

      <FormControl>
        <TextField
          label={text('Emergency contact email', 'E-mail contact noodgevallen')}
          value={newUser.iceContactEmail}
          onChange={(e) => handleChange('iceContactEmail', e.target.value)}
          variant="outlined"
          error={!!errors.iceContactEmail}
          helperText={errors.iceContactEmail && text(errors.iceContactEmail as Language)}
        />
      </FormControl>

      <FormControl>
        <TextField
          label={text('Emergency contact phone', 'Telefoon contact noodgevallen')}
          value={newUser.iceContactPhone}
          onChange={(e) => handleChange('iceContactPhone', e.target.value)}
          variant="outlined"
          error={!!errors.iceContactPhone}
          helperText={errors.iceContactPhone && text(errors.iceContactPhone as Language)}
        />
      </FormControl>

      <FormControls
        activeStep={2}
        handleBack={handleBack}
        handleNext={handleNext}
        validateInputs={validateInputs}
      />
    </Box>
  );
};