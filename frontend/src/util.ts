import {Language, labelOptions, User, Event, UserCommittee, CommitteeUser, RoleType} from './types.ts';

export function getLabel(id: string): Language {
  const categoryOption = labelOptions.find((option) => option.id === id);
  return categoryOption ? categoryOption.label : {en: id, nl: id};
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

export function isAdminOrBoard(roles: RoleType[]): boolean {
  const allowedRoles = [
    'admin',
    'chair',
    'secretary',
    'treasurer',
    'viceChair',
    'climbingCommissar',
  ];

  return roles.some(role => allowedRoles.includes(role));
}

export function isWorga(event: Event, user: User): boolean {
  return event.metadata?.worga === user.id
}

export function inCommittee(committees: UserCommittee[], committeeId: string): boolean {
  return committees.some(uc => uc.left == null && uc.committeeId === committeeId)
}

export function isChair(committeeMembers: CommitteeUser[], userId: string): boolean;
export function isChair(userCommittees: UserCommittee[], committeeId: string): boolean;

// Implementation
export function isChair(
  membersOrCommittees: CommitteeUser[] | UserCommittee[],
  id: string
): boolean {
  if (membersOrCommittees.length === 0) {return false;}

  const first = membersOrCommittees[0];

  if ('id' in first) {
    return (membersOrCommittees as CommitteeUser[]).some(
      member => member.id === id && member.role === 'chair'
    );
  } else if ('committeeId' in first) {
    return (membersOrCommittees as UserCommittee[]).some(
      uc => uc.committeeId === id && uc.left == null && uc.role === 'chair'
    );
  }

  return false;
}
