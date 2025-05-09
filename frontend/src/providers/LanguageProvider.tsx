import { createContext, ReactNode, useContext, useState } from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { Language, LanguageEnum } from '../types.ts';

interface LanguageContextType {
  language: LanguageEnum;
  setDutch: () => void;
  setEnglish: () => void;
  toggleLanguage: () => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<LanguageEnum>(
    navigator.language.slice(0, 2) === 'nl' ? 'nl' : 'en'
  );

  const setEnglish = () => {
    setLanguage('en');
  };

  const setDutch = () => {
    setLanguage('nl');
  };

  const toggleLanguage = () => (language === 'nl' ? setEnglish() : setDutch());


  return (
    <LanguageContext.Provider
      value={{ language, setDutch, setEnglish, toggleLanguage }}
    >
      <LocalizationProvider
        dateAdapter={AdapterMoment}
        adapterLocale={language}
      >
        {children}
      </LocalizationProvider>
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): {
  text: (en: string | Language, nl?: string) => string,
  lang: LanguageEnum,
  setDutch: () => void;
  setEnglish: () => void;
  toggleLanguage: () => void;
} => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  const text = function(en: string | Language, nl?: string): string {
    if (typeof en === 'string') {
      nl = nl || en;
      return context.language === 'nl' ? nl : en;
    } else {
      return context.language === 'nl' ? en.nl : en.en;
    }
  };

  return {
    text,
    lang: context.language,
    setDutch: context.setDutch,
    setEnglish: context.setEnglish,
    toggleLanguage: context.toggleLanguage
  };
};
