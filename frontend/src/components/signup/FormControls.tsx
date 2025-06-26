import React, {useState} from 'react';
import {Button, Checkbox, FormControlLabel} from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

interface FormControlsProps {
  activeStep: number;
  handleBack: () => void;
  handleNext: (e: React.FormEvent) => void;
  validateInputs: () => void;
}

export default function FormControls({
  activeStep,
  handleBack,
  handleNext,
  validateInputs,
}:FormControlsProps) {
  const { text } = useLanguage()
  const [consent, setConsent] = useState<boolean>(false)
  return (
    <>
      {activeStep === 3 && (
        <FormControlLabel
          control={
            <Checkbox
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
          }
          label={text(
            'I give permission to the NijSAC to save and process all personal data I enter on the site.',
            'Ik geef toestemming aan de NijSAC om alle persoonlijke informatie die ik invoer op de site op te slaan en te verwerken.'
          )}
        />
      )}
      <div className="flex justify-between">
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          {text('Back', 'Terug')}
        </Button>

        {activeStep === 3 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!consent}
          >
            {text('Signup', 'Inschrijven')}
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={validateInputs}
          >
            {text('Next', 'Volgende')}
          </Button>
        )}
      </div>
    </>
  );
};