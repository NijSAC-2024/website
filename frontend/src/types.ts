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

export interface ThemeContextType {
  themeCookie: { [x: string]: boolean };
  getThemeName: () => string;
  toggleTheme: () => void;
}

export interface LanguageContextType {
  language: boolean;
  getLangCode: () => string;
  getLocaleCode: () => string;
  setDutch: () => void;
  setEnglish: () => void;
  toggleLanguage: () => void;
}

export interface FormsProps {
  onClose: () => void;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export interface ValidateProps {
  label: string;
  // eslint-disable-next-line no-unused-vars
  validator: (value: string) => string | false;
  // eslint-disable-next-line no-unused-vars
  onChange: (isValid: boolean) => void;
  setValue: Dispatch<SetStateAction<string>>;
}

export interface I18nType<T> {
  [K: string]: T;
  'en-US': T;
  'nl-NL': T;
}

export type I18nStringType = I18nType<string>;

export interface CalendarCategoryType extends I18nStringType {
  id: string;
}

export interface CalendarEventType {
  id: string | number;
  image: string;
  title: I18nStringType;
  categoryId: string;
  categoryName: I18nStringType;
  descriptionMarkdown: I18nStringType;
  registrations: number;
  startDateTime: string;
  endDateTime: string;
  registerState: string;
  registrationOpenTime: string;
  registrationCloseTime: string;
}

export interface ExpandedCalendarEventType extends CalendarEventType {
  expandedDescriptionMarkdown: I18nStringType;
  registrationsTable: { [K: string]: string | number }[];
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
