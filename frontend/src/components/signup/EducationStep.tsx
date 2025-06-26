import { Box, FormControl, TextField } from '@mui/material';
import FormControls from './FormControls.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {StepProps} from './SignupForm.tsx';
import {Language} from '../../types.ts';

export default function EducationStep({
  newUser,
  errors,
  handleChange,
  handleNext,
  handleBack,
  validateInputs,
}: StepProps){
  const { text } = useLanguage()
  return (
    <Box className="grid lg:grid-cols-2 gap-y-4 gap-x-2.5" component="form" onSubmit={handleNext}>
      <FormControl>
        <TextField
          type="number"
          label={text('Student Number', 'Studentnummer')}
          value={newUser.studentNumber}
          onChange={(e) => handleChange('studentNumber', parseInt(e.target.value))}
          variant="outlined"
          error={!!errors.studentNumber}
          helperText={errors.studentNumber && text(errors.studentNumber as Language)}
        />
      </FormControl>

      <FormControl>
        <TextField
          type="number"
          label={text('Sportcard Number', 'Sportkaartnummer')}
          value={newUser.sportcardNumber}
          onChange={(e) => handleChange('sportcardNumber', parseInt(e.target.value))}
          variant="outlined"
          error={!!errors.sportcardNumber}
          helperText={errors.sportcardNumber && text(errors.sportcardNumber as Language)}
        />
      </FormControl>

      <FormControl className="lg:col-span-2">
        <TextField
          type="number"
          label={text('NKBV Number', 'NKBV-nummer')}
          value={newUser.nkbvNumber}
          onChange={(e) => handleChange('nkbvNumber', parseInt(e.target.value))}
          variant="outlined"
          error={!!errors.nkbvNumber}
          helperText={errors.nkbvNumber && text(errors.nkbvNumber as Language)}
        />
      </FormControl>

      <div className="lg:col-span-2">
        <FormControls
          activeStep={1}
          handleBack={handleBack}
          handleNext={handleNext}
          validateInputs={validateInputs}
        />
      </div>
    </Box>
  );
};