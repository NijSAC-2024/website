import { Language, eventOptions, LanguageEnum } from './types.ts';

export function text(lang: LanguageEnum, english: string, dutch: string): string;
export function text(lang: LanguageEnum, languageType: Language): string;
export function text(lang: LanguageEnum, arg1: string | Language, arg2?: string): string {
  if (typeof arg1 === 'string' && typeof arg2 === 'string') {
    return lang === 'en' ? arg1 : arg2;
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    return lang === 'en' ? arg1.en : arg1.nl;
  }
  throw new Error('Invalid arguments provided to text function');
}

export function getLabel(id: string): Language {
  const categoryOption = eventOptions.find((option) => option.id === id);
  return categoryOption ? categoryOption.label : { en: id, nl: id };
}
