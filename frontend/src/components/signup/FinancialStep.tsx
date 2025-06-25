import { Box, FormControl, TextField } from '@mui/material';
import { StepProps } from '../../types';
import FormControls from './FormControls.tsx';
export default function FinancialStep({
  formData,
  errors,
  handleChange,
  handleNext,
  handleBack,
  validateInputs,
}: StepProps){
  return (
    <Box className="grid gap-2.5" component="form" onSubmit={handleNext}>
      <FormControl>
        <TextField
          label="IBAN"
          value={formData.iban}
          onChange={(e) => handleChange('iban', e.target.value)}
          variant="outlined"
          error={!!errors.iban}
          helperText={errors.iban}
        />
      </FormControl>

      <FormControl>
        <TextField
          label="BIC"
          value={formData.bic}
          onChange={(e) => handleChange('bic', e.target.value)}
          variant="outlined"
          error={!!errors.bic}
          helperText={errors.bic}
        />
      </FormControl>

      <FormControls
        activeStep={2}
        handleBack={handleBack}
        handleNext={handleNext}
        validateInputs={validateInputs}
        consentGiven={false}
      />
    </Box>
  );
};