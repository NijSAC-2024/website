import { Dispatch, SetStateAction } from 'react';

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
}

export interface ValidateProps {
  label: string;
  // eslint-disable-next-line no-unused-vars
  validator: (value: string) => string | false;
  // eslint-disable-next-line no-unused-vars
  onChange: (isValid: boolean) => void;
  setValue: Dispatch<SetStateAction<string>>;
}

export interface LanguageType {
  en: string;
  nl: string;
}

export type OptionType = 'sp' | 'mp' | 'boulder' | 'trad' | 'education';

export interface AgendaEventType {
  id: number;
  image: string;
  title: LanguageType;
  category: 'activity' | 'course' | 'training' | 'weekend' | '';
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

export const options = [
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
