import { useLanguage } from './providers/LanguageProvider.tsx';

export default function text(english: string, dutch: string): string {
  const { language } = useLanguage();

  return language ? english : dutch;
}
