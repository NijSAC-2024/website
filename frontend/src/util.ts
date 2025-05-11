import { Language, eventOptions } from './types.ts';


export function getLabel(id: string): Language {
  const categoryOption = eventOptions.find((option) => option.id === id);
  return categoryOption ? categoryOption.label : { en: id, nl: id };
}
