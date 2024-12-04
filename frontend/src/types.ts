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

export interface AgendaEventType {
  id: number;
  image: string;
  titleEN: string;
  titleNL: string;
  category: string;
  locationEN: string;
  locationNL: string;
  descriptionMarkdownEN: string;
  descriptionMarkdownNL: string;
  registrations: number;
  maxRegistrations: number;
  startDateTime: string;
  endDateTime: string;
  registrationOpenTime: string;
  registrationCloseTime: string;
}

interface registrationType {
  id: number;
  name: string;
}

export interface ExpandedAgendaEventType {
  id: number;
  image: string;
  titleEN: string;
  titleNL: string;
  category: string;
  locationEN: string;
  locationNL: string;
  descriptionMarkdownEN: string;
  descriptionMarkdownNL: string;
  registrations: number;
  maxRegistrations: number;
  startDateTime: string;
  endDateTime: string;
  registrationOpenTime: string;
  registrationCloseTime: string;
  registrationsTable: registrationType[];
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
