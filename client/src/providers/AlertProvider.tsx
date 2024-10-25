import { createContext, useContext, useMemo, ReactNode, useState, SyntheticEvent } from 'react';
import { AlertContextType, AlertType } from '../types.ts';
import { SnackbarCloseReason } from '@mui/material';

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertType | undefined>(undefined);
  const changeAlert = (alert: AlertType) => {
    setAlert({ title: alert.title, text: alert.text, severity: alert.severity });
    setOpen(true);
  };

  const handleClose = (_event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const value = useMemo(
    () => ({
      open,
      alert,
      changeAlert,
      handleClose
    }),
    [open]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAuth must be used within a AlertProvider');
  }
  return context;
};
