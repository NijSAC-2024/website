import { useLanguage } from './providers/LanguageProvider.tsx';
import moment from 'moment/moment';

export function text(english: string, dutch: string): string {
  const { language } = useLanguage();

  return language ? english : dutch;
}

export function formatDate(startDateTime: string, endDateTime: string): string {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  const startDay = startDate.getDay() + 1;
  const endDay = endDate.getDay() + 1;
  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  if (startDay === endDay) {
    return moment(startDateTime).format('DD MMM HH:mm');
  } else if (startMonth === endMonth) {
    return moment(startDateTime).format('DD') + '-' + moment(endDateTime).format('DD MMM');
  } else {
    return moment(startDateTime).format('DD MMM') + '-' + moment(endDateTime).format('DD MMM');
  }
}

export function truncateMarkdown(markdown: string, maxLength: number): string {
  if (markdown.length <= maxLength) return markdown;

  let truncated = markdown.slice(0, maxLength);
  const lastCut = Math.max(truncated.lastIndexOf(' '), truncated.lastIndexOf('\n'));
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
