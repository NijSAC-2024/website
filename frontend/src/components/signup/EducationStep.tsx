import { Box, FormControl, TextField } from '@mui/material';
import { StepProps } from '../../types';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

export default function EducationStep({
  formData,
  errors,
  handleChange,
  handleNext,
  handleBack,
  validateInputs,
}: StepProps){
  const { text } = useLanguage()
  return (
    <Box className="grid lg:grid-cols-2 gap-y-4 gap-x-2.5" component="form" onSubmit={handleNext}>
      <FormControl className="lg:col-span-2">
        <TextField
          label={text('Educational Institution', 'Onderwijsinstelling')}
          value={formData.university}
          onChange={(e) => handleChange('university', e.target.value)}
          variant="outlined"
          error={!!errors.university}
          helperText={errors.university}
        />
      </FormControl>

      <FormControl>
        <TextField
          label={text('Student Number', 'Studentnummer')}
          value={formData.studentNumber}
          onChange={(e) => handleChange('studentNumber', e.target.value)}
          variant="outlined"
          error={!!errors.studentNumber}
          helperText={errors.studentNumber}
        />
      </FormControl>

      <FormControl>
        <TextField
          label={text('Sportcard Number', 'Sportkaartnummer')}
          value={formData.sportcardNumber}
          onChange={(e) => handleChange('sportcardNumber', e.target.value)}
          variant="outlined"
          error={!!errors.sportcardNumber}
          helperText={errors.sportcardNumber}
        />
      </FormControl>

      <FormControl className="lg:col-span-2">
        <TextField
          label={text('NKBV Number', 'NKBV-nummer')}
          value={formData.nkbvNumber}
          onChange={(e) => handleChange('nkbvNumber', e.target.value)}
          variant="outlined"
          error={!!errors.nkbvNumber}
          helperText={errors.nkbvNumber}
        />
      </FormControl>

      <div className="lg:col-span-2">
        <FormControls
          activeStep={1}
          handleBack={handleBack}
          handleNext={handleNext}
          validateInputs={validateInputs}
          consentGiven={false}
        />
      </div>
    </Box>
  );
};