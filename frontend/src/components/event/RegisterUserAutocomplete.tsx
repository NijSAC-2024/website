import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {BasicUser, Registration} from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {useApiState} from '../../providers/ApiProvider.tsx';

interface Props {
  registrations?: Registration[];
  selectedUser: BasicUser | null;
  setSelectedUser: (user: BasicUser | null) => void;
  setSelectedRegistration: (registration: Registration | null) => void;
  toggleRegisterDialog: () => void;
}

export default function RegisterUserAutocomplete({registrations, selectedUser, setSelectedUser, setSelectedRegistration, toggleRegisterDialog }: Props) {
  const { text } = useLanguage();
  const { users } = useApiState()

  return (
    <Autocomplete
      options={users.filter((u) => !registrations?.some((r) => r.userId === u.userId)) || []}
      getOptionLabel={(u: BasicUser) => `${u.firstName} ${u.infix ?? ''} ${u.lastName}`}
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
