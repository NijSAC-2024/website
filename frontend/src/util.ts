import {Language, labelOptions} from './types.ts';

export function getLabel(id: string): Language {
  const categoryOption = labelOptions.find((option) => option.id === id);
  return categoryOption ? categoryOption.label : { en: id, nl: id };
}

export function truncateMarkdown(markdown: string, maxLength: number): string {
  if (markdown.length <= maxLength) {
    return markdown;
  }

  let truncated = markdown.slice(0, maxLength);
  const lastCut = Math.max(
    truncated.lastIndexOf(' '),
    truncated.lastIndexOf('\n')
  );
  truncated = lastCut > -1 ? truncated.slice(0, lastCut) : truncated;

  const unmatchedTags = (truncated.match(/(\*\*|\*|_|`)/g) || []).length % 2;
  if (unmatchedTags) {
    truncated = truncated.slice(
      0,
      truncated.lastIndexOf((truncated.match(/(\*\*|\*|_|`)/g) || []).pop()!)
    );
  }
  return truncated.trim() + '…';
}
