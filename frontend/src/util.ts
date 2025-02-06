import { useLanguage } from './providers/LanguageProvider.tsx';
import { Language, eventOptions } from './types.ts';

export function text(english: string, dutch: string): string;
export function text(languageType: Language): string;
export function text(arg1: string | Language, arg2?: string): string {
  const { language } = useLanguage();

  if (typeof arg1 === 'string' && typeof arg2 === 'string') {
    return language ? arg1 : arg2;
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    return language ? arg1.en : arg1.nl;
  }

  throw new Error('Invalid arguments provided to text function');
}

export function getLabel(id: string): Language {
  const categoryOption = eventOptions.find((option) => option.id === id);
  return categoryOption ? categoryOption.label : { en: id, nl: id };
}
