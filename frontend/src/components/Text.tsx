import { useLanguage } from '../providers/LanguageProvider.tsx';

interface TextProps {
  english: string;
  dutch: string;
}

export default function Text({ english, dutch }: TextProps) {
  const { language } = useLanguage();

  return language ? english : dutch;
}
