import { createContext, useContext, useMemo, ReactNode, useState } from 'react';
import { LanguageContextType } from '../types.ts';
// import { enqueueSnackbar } from 'notistack';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<boolean>(navigator.language.slice(0, 2) === 'en');

  const setEnglish = () => {
    setLanguage(true);
    // enqueueSnackbar('Changed language to English.', {
    //   variant: 'info'
    // });
  };

  const setDutch = () => {
    // enqueueSnackbar('Taal veranderd naar Nederlands.', {
    //   variant: 'info'
    // });
    setLanguage(false);
  };

  const getLangCode = () => (language ? 'en' : 'nl');

  const toggleLanguage = () => (language ? setDutch() : setEnglish());

  const value = useMemo(
    () => ({
      language,
      getLangCode,
      setDutch,
      setEnglish,
      toggleLanguage
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a LanguageProvider');
  }
  return context;
};
