export const NON_MEMBER_NAME_QUESTION_ID = '8d3d4e48-4e8f-4e15-a7d9-6ff5e4c8e8ad';

import {Language, Registration} from '../../types.ts';

export function getRegistrationDisplayName(registration: Registration): Language {
  const memberName = [registration.firstName, registration.infix, registration.lastName]
    .filter((part) => !!part && part.trim().length > 0)
    .join(' ')
    .trim();

  if (memberName.length > 0) {
    return {en: memberName, nl: memberName};
  }

  const nonMemberName = registration.answers
    .find((answer) => answer.questionId === NON_MEMBER_NAME_QUESTION_ID)
    ?.answer
    ?.trim();

  return nonMemberName && nonMemberName.length > 0 ? {
    en: `${nonMemberName} (Non Member)`,
    nl: `${nonMemberName} (Niet Lid)`
  } : {en: 'Unknown', nl: 'Onbekend'};
}
