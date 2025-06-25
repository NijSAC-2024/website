import { Box, FormControl, TextField } from '@mui/material';
import { StepProps } from '../../types';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

export default function EmergencyContactStep({
  formData,
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
          label={text('Emergency Contact Name', 'Naam Contact voor Noodgevallen')}
          value={formData.iceContactName}
          onChange={(e) => handleChange('iceContactName', e.target.value)}
          variant="outlined"
          error={!!errors.iceContactName}
          helperText={errors.iceContactName}
        />
      </FormControl>

      <FormControl>
        <TextField
          label={text('Emergency Contact Email', 'Email Contact voor Noodgevallen')}
          value={formData.iceContactName}
          onChange={(e) => handleChange('iceContactEmail', e.target.value)}
          variant="outlined"
          error={!!errors.iceContactName}
          helperText={errors.iceContactName}
        />
      </FormControl>

      <FormControl>
        <TextField
          label={text('Emergency Contact Phone', 'Telefoon Contact voor Noodgevallen')}
          value={formData.iceContactPhone}
          onChange={(e) => handleChange('iceContactPhone', e.target.value)}
          variant="outlined"
          error={!!errors.iceContactPhone}
          helperText={errors.iceContactPhone}
        />
      </FormControl>

      <FormControls
        activeStep={3}
        handleBack={handleBack}
        handleNext={handleNext}
        validateInputs={validateInputs}
        consentGiven={false}
      />
    </Box>
  );
};