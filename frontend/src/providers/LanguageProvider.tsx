import { createContext, useContext, useMemo, ReactNode, useState } from 'react';
// import { enqueueSnackbar } from 'notistack';

interface LanguageContextType {
  language: boolean;
  getLangCode: () => string;
  setDutch: () => void;
  setEnglish: () => void;
  toggleLanguage: () => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<boolean>(navigator.language.slice(0, 2) !== 'nl');

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
