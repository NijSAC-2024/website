import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Registration, User } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface Props {
  users: User[];
  registrations?: Registration[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  setSelectedRegistration: (registration: Registration | null) => void;
  toggleRegisterDialog: () => void;
}

export default function RegisterUserAutocomplete({ users, registrations, selectedUser, setSelectedUser, setSelectedRegistration, toggleRegisterDialog }: Props) {
  const { text } = useLanguage();

  return (
    <Autocomplete
      options={users.filter((u) => !registrations?.some((r) => r.userId === u.id)) || []}
      getOptionLabel={(u: User) => `${u.firstName} ${u.infix ?? ''} ${u.lastName}`}
      value={selectedUser}
      onChange={(_, value) => {
        setSelectedUser(value);
        setSelectedRegistration(null);
        if (value) {
          toggleRegisterDialog();
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label={text('Register user', 'Schrijf gebruiker in')} />
      )}
    />
  );
}
