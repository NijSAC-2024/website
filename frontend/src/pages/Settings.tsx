import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import DisplayOptions from '../components/DisplayOptions.tsx';
import {useThemeMode} from '../providers/ThemeProvider.tsx';
import {LanguageEnum, ThemeType} from '../types.ts';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import TextCard from '../components/TextCard.tsx';

export default function Settings() {
  const {themeMode, setTheme} = useThemeMode();
  const { language, text, setLang } = useLanguage();
  const themes = [
    {
      name: {en: 'Automatic', nl: 'Automatisch'},
      value: 'auto',
    },
    {
      name: {en: 'Light mode', nl: 'Lichte weergave'},
      value: 'light',
    },
    {
      name: {en: 'Dark mode', nl: 'Donkere weergave'},
      value: 'dark',
    }
  ];

  const languages = [
    {
      name: {en: 'English', nl: 'Engels'},
      value: 'en',
    },
    {
      name: {en: 'Dutch', nl: 'Nederlands'},
      value: 'nl',
    }
  ];

  const onThemeChange = (mode: string) => setTheme(mode as ThemeType)
  const onLanguageChange = (lang: string) => setLang(lang as LanguageEnum)

  return (
    <GenericPage>
      <ContentCard className="p-7">
        <TextCard className="p-6">
          <DisplayOptions title={text('Language', 'Taal')} value={language} onChange={onLanguageChange} options={languages} />
          <div className="pt-4">
            <DisplayOptions title={text('Display options', 'Weergaveopties')} value={themeMode} onChange={onThemeChange} options={themes} />
          </div>
        </TextCard>
      </ContentCard>
    </GenericPage>
  );
}
