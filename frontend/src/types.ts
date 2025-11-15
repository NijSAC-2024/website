import {WebsiteError} from './error/error.ts';
import {RouterState} from './router.ts';

export type ThemeType = 'dark' | 'light' | 'auto';

export type WeekendType = 'sp' | 'mp' | 'boulder' | 'trad' | 'education';

export type ExperienceType = 'sp' | 'mp';

export type EventType = 'activity' | 'course' | 'training' | 'weekend';

export type ErrorType = Language | boolean;

export type MembershipStatus =
  | 'pending'
  | 'member'
  | 'affiliated'
  | 'nonMember'
  | 'donor';

export type CommitteeRoleType = 'chair' | 'member';

export type QuestionTypeType = 'text' | 'multipleChoice' | 'number' | 'boolean' | 'date';

export interface QuestionType {
  type: QuestionTypeType;
  options?: Language[];
}

export type LanguageEnum = 'nl' | 'en';

export type RoleType =
  | 'admin'
  | 'treasurer'
  | 'secretary'
  | 'chair'
  | 'viceChair'
  | 'climbingCommissar'

export interface OptionsType {
  id:
    | WeekendType
    | EventType
    | MembershipStatus
    | QuestionType
    | ExperienceType
    | QuestionTypeType
    | RoleType
    | CommitteeRoleType;
  label: Language;
}

export interface Language {
  en: string;
  nl: string;
}

export interface DateType {
  start: string;
  end: string;
}

export interface Registration extends Partial<BasicUser> {
  registrationId: string;
  eventId: string;
  attended?: boolean;
  waitingListPosition?: number;
  answers: Array<Answer>;
  created: string;
  updated: string;
}

export interface Answer {
  questionId: string;
  answer: string;
}

export interface Question {
  id: string;
  question: Language;
  questionType: QuestionType;
  required: boolean;
}

export interface Metadata {
  experience?: ExperienceType[];
  type?: WeekendType[];
  gear?: Language;
  worga?: string;
}

export interface Event extends Omit<EventContent, 'location'> {
  id: string;
  created: string;
  updated: string;
  registrationCount: number;
  waitingListCount: number;
  location: Location;
}

export function toEventContent(event: Event): EventContent {
  const location_id = event.location.id;
  const eventContent = {...event} as unknown as EventContent;
  eventContent.location = location_id;
  return eventContent;
}

export interface EventContent {
  name: Language;
  image?: string;
  description?: Language;
  dates: DateType[];
  registrationPeriod?: DateType;
  registrationMax?: number;
  waitingListMax?: number;
  isPublished: boolean;
  requiredMembershipStatus: MembershipStatus[];
  eventType: EventType;
  questions: Question[];
  metadata?: Metadata;
  location: string;
  createdBy?: string;
}

export interface Location extends LocationContent {
  id: string;
  created: Date;
  updated: Date;
}

export interface LocationContent {
  name: Language;
  reusable: boolean;
  description?: Language;
}

export interface UserCommittee {
  userId: string;
  committeeId: string;
  role: CommitteeRoleType;
  joined: string;
  left?: string;
}

export function toCommitteeContent(committee: Committee | undefined): CommitteeContent {
  return {...committee} as unknown as CommitteeContent;
}

export interface Committee extends CommitteeContent {
  id: string;
  created: string;
  updated: string;
}

export interface CommitteeContent {
  name: Language;
  description?: Language;
  image?: string;
}

export function toUserContent(user: User | undefined, password: string = ''): UserContent {
  const userContent = {...user} as unknown as UserContent;
  userContent.password = password;
  return userContent;
}

export interface BasicUser {
  id: string;
  firstName: string;
  infix?: string;
  lastName: string;
  roles: RoleType[];
  status: MembershipStatus;
}

export interface UserContent extends Omit<BasicUser, 'id'> {
  firstName: string;
  infix?: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  importantInfo?: string;
  studentNumber: number;
  nkbvNumber: number;
  sportcardNumber: number;
  iceContactName: string;
  iceContactEmail: string;
  iceContactPhone: string;
}

export interface User extends Omit<UserContent, 'password'> {
  id: string;
  created: string;
  updated: string;
}

export interface rentOption {
  name: Language;
  price: number;
  remark?: Language;
}

export interface ReservationType {
  user?: string;
  startDate: string;
  endDate: string;
  items: ReservationItemType[];
  remarks?: string;
}

export interface ReservationItemType {
  name: Language;
  price: number;
  amount: number;
}

export interface State {
  version: string;
  events: Event[] | null;
  registrations: Registration[] | null;
  // Holds the registrations a logged-in user is registered for
  userEventRegistrations: Registration[] | null;
  myCommittees: UserCommittee[] | null;
  committees: Committee[] | null;
  committeeMembers: BasicUser[] | null;
  locations: Location[] | null;
  user: User | null;
  users: User[] | null;
  routerState: RouterState;
  nextRouterState: RouterState | null;
  error: WebsiteError | null;
}

export type Action =
  | {
    type: 'set_user';
    user: User | null;
  } | {
    type: 'set_users';
    users: User[];
  } | {
    type: 'set_events';
    events: Event[];
  } | {
    type: 'set_locations';
    locations: Location[];
  } | {
    type: 'set_event_registrations';
    registrations: Registration[];
  } | {
    type: 'set_user_event_registrations';
    registrations: Registration[];
  } | {
    type: 'set_my_committees';
    committees: UserCommittee[];
  } | {
    type: 'set_committees';
    committees: Committee[];
  } | {
    type: 'set_committee_members';
    members: BasicUser[];
  } | {
    type: 'set_error';
    error: WebsiteError;
  } | {
    type: 'set_next_router_state';
    nextRouterState: RouterState | null;
  }
  | {
    type: 'set_route';
    routerState: RouterState;
  };

export type MenuType =
  | 'association'
  | 'climbing'
  | 'alps'
  | undefined;

export const roleOptions: OptionsType[] = [
  {id: 'admin', label: {en: 'Admin', nl: 'Beheerder'}},
  {id: 'treasurer', label: {en: 'Treasurer', nl: 'Penningmeester'}},
  {id: 'secretary', label: {en: 'Secretary', nl: 'Secretaris'}},
  {id: 'chair', label: {en: 'Chair', nl: 'Voorzitter'}},
  {id: 'viceChair', label: {en: 'Vice Chair', nl: 'Vicevoorzitter'}},
  {id: 'climbingCommissar', label: {en: 'Climbing Commissar', nl: 'Klimcommissaris'}}
];

export const typesOptions: OptionsType[] = [
  {id: 'sp', label: {en: 'Single Pitch', nl: 'Single Pitch'}},
  {id: 'mp', label: {en: 'Multi Pitch', nl: 'Multi Pitch'}},
  {id: 'education', label: {en: 'Education', nl: 'Opleiding'}},
  {id: 'boulder', label: {en: 'Bouldering', nl: 'Boulderen'}},
  {id: 'trad', label: {en: 'Trad', nl: 'Trad'}}
];

export const experienceOptions: OptionsType[] = [
  {id: 'sp', label: {en: 'Single Pitch', nl: 'Single Pitch'}},
  {id: 'mp', label: {en: 'Multi Pitch', nl: 'Multi Pitch'}},
  {id: 'trad', label: {en: 'Trad', nl: 'Trad'}}
];

export const memberOptions: OptionsType[] = [
  {id: 'member', label: {en: 'Member', nl: 'Lid'}},
  {
    id: 'affiliated',
    label: {en: 'Affiliated', nl: 'Aangeslotene'}
  },
  {id: 'nonMember', label: {en: 'Non Member', nl: 'Niet Lid'}},
  {id: 'pending', label: {en: 'Pending', nl: 'In afwachting'}}
];

export const labelOptions: OptionsType[] = [
  {id: 'activity', label: {en: 'Activity', nl: 'Activiteit'}},
  {id: 'course', label: {en: 'Course', nl: 'Cursus'}},
  {id: 'training', label: {en: 'Training', nl: 'Training'}},
  {id: 'weekend', label: {en: 'Weekend', nl: 'Weekend'}},
  {id: 'sp', label: {en: 'Single Pitch', nl: 'Single Pitch'}},
  {id: 'mp', label: {en: 'Multi Pitch', nl: 'Multi Pitch'}},
  {id: 'education', label: {en: 'Education', nl: 'Opleiding'}},
  {id: 'boulder', label: {en: 'Bouldering', nl: 'Boulderen'}},
  {id: 'trad', label: {en: 'Trad', nl: 'Trad'}},
  {id: 'member', label: {en: 'Member', nl: 'Lid'}},
  {id: 'affiliated', label: {en: 'Affiliated', nl: 'Aangeslotene'}},
  {id: 'donor', label: {en: 'Donor', nl: 'Donateur'}},
  {id: 'nonMember', label: {en: 'Non Member', nl: 'Niet Lid'}},
  {id: 'pending', label: {en: 'Pending', nl: 'In afwachting'}},
  {id: 'text', label: {en: 'Text Question', nl: 'Tekstvraag'}},
  {id: 'multipleChoice', label: {en: 'Option Question', nl: 'Meerkeuzevraag'}},
  {id: 'number', label: {en: 'Number Question', nl: 'Getalvraag'}},
  {id: 'boolean', label: {en: 'Checkbox Question', nl: 'Checkboxvraag'}},
  {id: 'date', label: {en: 'Date & Time Question', nl: 'Datum- & Tijdvraag'}},
  {id: 'admin', label: {en: 'Admin', nl: 'Beheerder'}},
  {id: 'treasurer', label: {en: 'Treasurer', nl: 'Penningmeester'}},
  {id: 'secretary', label: {en: 'Secretary', nl: 'Secretaris'}},
  {id: 'chair', label: {en: 'Chair', nl: 'Voorzitter'}},
  {id: 'viceChair', label: {en: 'Vice Chair', nl: 'Vicevoorzitter'}},
  {id: 'climbingCommissar', label: {en: 'Climbing Commissar', nl: 'Klimcommissaris'}}
];

export const rentOptions: rentOption[] = [
  {
    name: {
      en: 'Belay device (ATC or smart)',
      nl: 'Zekerapparaat (ATC of smart)'
    },
    price: 0.5
  },
  {
    name: {
      en: 'Carabiner (screw or safebiner)',
      nl: 'Karabiner (schroefbiner of safebiner)'
    },
    price: 0.5
  },
  {name: {en: 'Sling', nl: 'Schlinge'}, price: 0.5},
  {name: {en: 'Climbing helmet', nl: 'Klimhelm'}, price: 1.0},
  {name: {en: 'Harness', nl: 'Heupgordel'}, price: 1.5},
  {name: {en: 'Via ferrata set', nl: 'Klettersteigset'}, price: 0.5},
  {name: {en: 'Ohm', nl: 'Ohm'}, price: 1.0},
  {
    name: {en: 'Bivouac sack', nl: 'Bivakzak'},
    price: 1.0,
    remark: {en: '(per month)', nl: '(per maand)'}
  },
  {name: {en: 'Ice axe', nl: 'Pickel'}, price: 0.5},
  {name: {en: 'Ice drill', nl: 'IJsboor'}, price: 1.0},
  {
    name: {
      en: 'Crampons (incl. crampon cover)',
      nl: 'Stijgijzers (incl. stijgijzerhoes)'
    },
    price: 0.5
  },
  {name: {en: 'Tarp', nl: 'Tarp'}, price: 1.5},
  {
    name: {en: 'Ice axes (per two)', nl: 'IJsbijl (per twee)'},
    price: 15.0,
    remark: {en: '(per week)', nl: '(per week)'}
  },
  {
    name: {
      en: 'Nuts (per set incl. nut tool)',
      nl: 'Nuts (per bos incl. nuttenfrutter)'
    },
    price: 0.5
  },
  {name: {en: 'Camalot/Friend', nl: 'Camalot/Friend'}, price: 0.5},
  {name: {en: 'Other trad gear', nl: 'Overig trad gear'}, price: 1.0},
  {
    name: {en: 'Quickdraws (per 6)', nl: 'Setjes (per 6 stuks)'},
    price: 0.5
  },
  {name: {en: 'Crash pad', nl: 'Crashpad'}, price: 3.5},
  {name: {en: 'Single rope', nl: 'Enkeltouw'}, price: 1.5},
  {name: {en: 'Alpine rope', nl: 'Alpien touw'}, price: 1.5},
  {
    name: {en: 'Double rope (per strand)', nl: 'Dubbeltouw (per streng)'},
    price: 1.0
  },
  {name: {en: 'Training rope', nl: 'Oefentouw'}, price: 0.0},
  {name: {en: 'Stove', nl: 'Brander'}, price: 0.5},
  {name: {en: 'Cooking gear', nl: 'Kookgerei'}, price: 0.0},
  {
    name: {en: 'Topo', nl: 'Topo'},
    price: 0.0,
    remark: {
      en: '(€5.00 per month after 1 month)',
      nl: '(€5,00 per maand na 1 maand)'
    }
  },
  {
    name: {
      en: 'Climbing set (harness, safebiner, belay device)',
      nl: 'Klimset (heupgordel, safebiner, zekerapparaat)'
    },
    price: 5.0,
    remark: {en: '(for max. 6 months)', nl: '(voor max. 6 maanden)'}
  }
];
