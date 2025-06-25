import React from 'react';
import { Button } from '@mui/material';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

interface FormControlsProps {
  activeStep: number;
  handleBack: () => void;
  handleNext: (e: React.FormEvent) => void;
  validateInputs: () => void;
  consentGiven: boolean;
}

export default function FormControls({
  activeStep,
  handleBack,
  handleNext,
  validateInputs,
  consentGiven,
}:FormControlsProps) {
  const { text } = useLanguage()
  return (
    <div className="flex justify-between">
      <Button
        color="inherit"
        disabled={activeStep === 0}
        onClick={handleBack}
      >
        {text('Back', 'Terug')}
      </Button>

      {activeStep === 4 ? (
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!consentGiven}
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
  );
};