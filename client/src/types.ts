import { SyntheticEvent } from 'react';
import { SnackbarCloseReason } from '@mui/material';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
}

export interface AlertType {
  title: string;
  text: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
}

export interface AuthContextType {
  authCookie: { [x: string]: any };
  login: (data: { token: string }) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export interface ThemeContextType {
  themeCookie: { [x: string]: any };
  toggleTheme: () => void;
}

export interface AlertContextType {
  open: boolean;
  alert: AlertType | undefined;
  changeAlert: (alert: AlertType) => void;
  handleClose: (_event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
}
