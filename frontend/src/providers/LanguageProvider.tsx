import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { LanguageEnum } from '../types.ts';

interface LanguageContextType {
  language: LanguageEnum;
  setDutch: () => void;
  setEnglish: () => void;
  toggleLanguage: () => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<LanguageEnum>(navigator.language.slice(0, 2) === 'nl' ? 'nl' : 'en');

  const setEnglish = () => {
    setLanguage('en');
  };

  const setDutch = () => {
    setLanguage('nl');
  };

  const toggleLanguage = () => (language === 'nl' ? setEnglish() : setDutch());

  // const value = useMemo(
  //   () => {
  //     const toggleLanguage = () => (language === 'nl' ? setEnglish() : setDutch());
  //     return {
  //       language,
  //       setDutch,
  //       setEnglish,
  //       toggleLanguage
  //     };
  //   },
  //   [language]
  // );

  return (
    <LanguageContext.Provider value={{language, setDutch, setEnglish, toggleLanguage}}>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={language}>
        {children}
      </LocalizationProvider>
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
