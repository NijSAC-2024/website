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
  numberOfRegistrations: number;
  maxRegistrations: number;
  startDateTime: string;
  endDateTime: string;
  registrationOpenTime: string;
  registrationCloseTime: string;
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
