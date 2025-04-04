export interface ValidateProps {
  label: string;
  validator: (value: string) => string | false;
  onChange: (isValid: boolean) => void;
  setValue: (value: string) => void;
}

export type WeekendType = 'sp' | 'mp' | 'boulder' | 'trad' | 'education';

export type ActivityType = 'activity' | 'course' | 'training' | 'weekend';

export type MembershipStatus = 'pending' | 'member' | 'extraordinary' | 'nonMember';

export type QuestionType = 'shortText' | 'longText' | 'number' | 'time';

export type LanguageEnum = 'nl' | 'en';

export interface OptionsType {
  id: WeekendType | ActivityType | MembershipStatus | QuestionType;
  label: Language;
}

export interface Language {
  en: string;
  nl: string;
}

export interface DateType {
  start: Date;
  end: Date;
}

export interface Registration extends BasicUser{
  attended?: boolean,
  waitingListPosition?: number,
  answers: Array<Answer>,
  created: string,
  updated: string,
}

export interface Answer {
  questionId: string,
  answer: string,
}

export interface Question {
  id: string;
  question: Language;
  questionType: QuestionType;
  required: boolean;
}

export interface Activity extends Omit<ActivityContent, 'location'> {
  id: string;
  created: string;
  updated: string;
  registrationCount: number;
  waitingListCount: number;
  location: Location;
}

export function toActivityContent(activity: Activity): ActivityContent {
  const location_id = activity.location.id;
  const activityContent = (activity as unknown as ActivityContent);
  activityContent.location = location_id;
  return activityContent;
}

export interface ActivityContent {
  name: Language;
  image?: string;
  description?: Language;
  dates: DateType[];
  registrationPeriod?: DateType;
  registrationMax?: number;
  waitingListMax?: number;
  isPublished: boolean;
  requiredMembershipStatus: MembershipStatus[];
  activityType: ActivityType;
  questions: Question[];
  metadata?: {
    experience?: string[];
    type?: string[];
    gear?: Language;
  };
  location: string,
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

interface registrationType {
  eid: number;
  name: string;
}

export interface registrationsType {
  registrations: registrationType[];
}

export interface BasicUser {
  userId: string,
  firstName: string,
  infix?: string,
  lastName: string,
}

export interface User {
  id: string;
  created: string;
  updated: string;
  firstName: string;
  infix: string;
  lastName: string;
  phone: string;
  studentNumber: string;
  nkbvNumber: number;
  sportcardNumber: number;
  iceContactName: string;
  iceContactEmail: null;
  iceContactPhone: null;
  importantInfo: null;
  roles: [];
  status: MembershipStatus;
  email: string;
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


export interface Route {
  name: string;
  path: string;
  params?: RouteParams;
}

export type RouteParams = Record<string, string>;
export type Navigate = (name: string, params: RouteParams) => void;

export interface State {
  version: string,
  route: Route,
  user?: User,
  activities?: Activity[],
  activity?: Activity,
}

export type MenuType = 'association' | 'climbing' | 'alps' | 'language' | undefined;

export const typesOptions: OptionsType[] = [
  { id: 'sp', label: { en: 'Single Pitch', nl: 'Single Pitch' } },
  { id: 'mp', label: { en: 'Multi Pitch', nl: 'Multi Pitch' } },
  { id: 'education', label: { en: 'Education', nl: 'Opleiding' } },
  { id: 'boulder', label: { en: 'Bouldering', nl: 'Boulderen' } },
  { id: 'trad', label: { en: 'Trad', nl: 'Trad' } }
];

export const experienceOptions: OptionsType[] = [
  { id: 'sp', label: { en: 'Single Pitch', nl: 'Single Pitch' } },
  { id: 'mp', label: { en: 'Multi Pitch', nl: 'Multi Pitch' } }
];

export const memberOptions: OptionsType[] = [
  { id: 'member', label: { en: 'Member', nl: 'Lid' } },
  { id: 'extraordinary', label: { en: 'Extraordinary Member', nl: 'Buitengewoon Lid' } },
  { id: 'nonMember', label: { en: 'Non Member', nl: 'Niet Lid' } },
  { id: 'pending', label: { en: 'Pending', nl: 'In afwachting' } }
];

export const eventOptions = [
  { id: 'activity', label: { en: 'Activity', nl: 'Activiteit' } },
  { id: 'course', label: { en: 'Course', nl: 'Cursus' } },
  { id: 'training', label: { en: 'Training', nl: 'Training' } },
  { id: 'weekend', label: { en: 'Weekend', nl: 'Weekend' } },
  { id: 'sp', label: { en: 'Single Pitch', nl: 'Single Pitch' } },
  { id: 'mp', label: { en: 'Multi Pitch', nl: 'Multi Pitch' } },
  { id: 'education', label: { en: 'Education', nl: 'Opleiding' } },
  { id: 'boulder', label: { en: 'Bouldering', nl: 'Boulderen' } },
  { id: 'trad', label: { en: 'Trad', nl: 'Trad' } }
];

export const rentOptions: rentOption[] = [
  { name: { en: 'Belay device (ATC or smart)', nl: 'Zekerapparaat (ATC of smart)' }, price: 0.5 },
  {
    name: { en: 'Carabiner (screw or safebiner)', nl: 'Karabiner (schroefbiner of safebiner)' },
    price: 0.5
  },
  { name: { en: 'Sling', nl: 'Schlinge' }, price: 0.5 },
  { name: { en: 'Climbing helmet', nl: 'Klimhelm' }, price: 1.0 },
  { name: { en: 'Harness', nl: 'Heupgordel' }, price: 1.5 },
  { name: { en: 'Via ferrata set', nl: 'Klettersteigset' }, price: 0.5 },
  { name: { en: 'Ohm', nl: 'Ohm' }, price: 1.0 },
  {
    name: { en: 'Bivouac sack', nl: 'Bivakzak' },
    price: 1.0,
    remark: { en: '(per month)', nl: '(per maand)' }
  },
  { name: { en: 'Ice axe', nl: 'Pickel' }, price: 0.5 },
  { name: { en: 'Ice drill', nl: 'IJsboor' }, price: 1.0 },
  {
    name: { en: 'Crampons (incl. crampon cover)', nl: 'Stijgijzers (incl. stijgijzerhoes)' },
    price: 0.5
  },
  { name: { en: 'Tarp', nl: 'Tarp' }, price: 1.5 },
  {
    name: { en: 'Ice axes (per two)', nl: 'IJsbijl (per twee)' },
    price: 15.0,
    remark: { en: '(per week)', nl: '(per week)' }
  },
  {
    name: { en: 'Nuts (per set incl. nut tool)', nl: 'Nuts (per bos incl. nuttenfrutter)' },
    price: 0.5
  },
  { name: { en: 'Camalot/Friend', nl: 'Camalot/Friend' }, price: 0.5 },
  { name: { en: 'Other trad gear', nl: 'Overig trad gear' }, price: 1.0 },
  { name: { en: 'Quickdraws (per 6)', nl: 'Setjes (per 6 stuks)' }, price: 0.5 },
  { name: { en: 'Crash pad', nl: 'Crashpad' }, price: 3.5 },
  { name: { en: 'Single rope', nl: 'Enkeltouw' }, price: 1.5 },
  { name: { en: 'Alpine rope', nl: 'Alpien touw' }, price: 1.5 },
  { name: { en: 'Double rope (per strand)', nl: 'Dubbeltouw (per streng)' }, price: 1.0 },
  { name: { en: 'Training rope', nl: 'Oefentouw' }, price: 0.0 },
  { name: { en: 'Stove', nl: 'Brander' }, price: 0.5 },
  { name: { en: 'Cooking gear', nl: 'Kookgerei' }, price: 0.0 },
  {
    name: { en: 'Topo', nl: 'Topo' },
    price: 0.0,
    remark: { en: '(€5.00 per month after 1 month)', nl: '(€5,00 per maand na 1 maand)' }
  },
  {
    name: {
      en: 'Climbing set (harness, safebiner, belay device)',
      nl: 'Klimset (heupgordel, safebiner, zekerapparaat)'
    },
    price: 5.0,
    remark: { en: '(for max. 6 months)', nl: '(voor max. 6 maanden)' }
  }
];
