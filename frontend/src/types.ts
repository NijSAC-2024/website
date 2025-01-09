export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
}

export interface AuthContextType {
  user: UserType | undefined;
  isLoggedIn: boolean;
  checkAuth: () => void;
  logout: () => void;
  authOpen: boolean;
  toggleAuthOpen: () => void;
}

export interface ValidateProps {
  label: string;
  // eslint-disable-next-line no-unused-vars
  validator: (value: string) => string | false;
  // eslint-disable-next-line no-unused-vars
  onChange: (isValid: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  setValue: (value: string) => void;
}

export interface LanguageType {
  en: string;
  nl: string;
}

export type OptionType = 'sp' | 'mp' | 'boulder' | 'trad' | 'education';

export interface LanguageType {
  en: string;
  nl: string;
}

export type CategoryType = 'activity' | 'course' | 'training' | 'weekend' | '' | 'all';

export interface AgendaEventType {
  id: number;
  image: string;
  title: LanguageType;
  category: CategoryType;
  type: OptionType[];
  location: string;
  descriptionMarkdown: LanguageType;
  gear: LanguageType;
  experience: OptionType[];
  allowsRegistrations: boolean;
  numberOfRegistrations: number;
  maxRegistrations: number;
  startDateTime: string;
  endDateTime: string;
  registrationOpenTime: string;
  registrationCloseTime: string;
  registrationFields: LanguageType[];
}

interface registrationType {
  eid: number;
  name: string;
}

export interface registrationsType {
  registrations: registrationType[];
}

export interface UserType {
  id: string;
  created: string;
  updated: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: string;
  email: string;
}

export interface rentOption {
  name: LanguageType;
  price: number;
  remark?: LanguageType;
}

export interface ReservationType {
  user?: string;
  startDate: string;
  endDate: string;
  items: ReservationItemType[];
  remarks?: string;
}

export interface ReservationItemType {
  name: LanguageType;
  price: number;
  amount: number;
}

export type MenuType = 'association' | 'climbing' | 'alps' | 'language' | undefined;

export interface OptionsType {
  id: OptionType;
  label: LanguageType;
}

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
