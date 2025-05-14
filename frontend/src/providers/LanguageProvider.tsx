import { createContext, ReactNode, useContext, useState } from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { Language, LanguageEnum } from '../types.ts';
import {useCookies} from 'react-cookie';

interface LanguageContextType {
  text: (en: string | Language, nl?: string) => string,
  language: LanguageEnum;
  setLang: (language: LanguageEnum) => void;
  toggleLanguage: () => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [langCookie, setLangCookie] = useCookies(['lang']);
  const [language, setLanguage] = useState<LanguageEnum>(langCookie.lang? langCookie.lang : navigator.language.slice(0, 2) === 'nl' ? 'nl' : 'en');

  const setLang = (lang: LanguageEnum) => {
    setLangCookie('lang', lang, {
      secure: true,
      sameSite: 'strict'
    });
    setLanguage(lang);
  }

  const toggleLanguage = () => (language === 'nl' ? setLanguage('en') : setLanguage('nl'));

  const text = function(en: string | Language, nl?: string): string {
    if (typeof en === 'string') {
      nl = nl || en;
      return language === 'nl' ? nl : en;
    } else {
      return language === 'nl' ? en.nl : en.en;
    }
  };

  return (
    <LanguageContext.Provider
      value={{ text, language, setLang, toggleLanguage }}
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

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
