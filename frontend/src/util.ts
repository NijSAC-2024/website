import {Language, labelOptions} from './types.ts';


export function getLabel(id: string): Language {
  const categoryOption = labelOptions.find((option) => option.id === id);
  return categoryOption ? categoryOption.label : { en: id, nl: id };
}
