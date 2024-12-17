import { AgendaEventType } from '../types.ts';
import { text } from '../util.ts';
import { Button, TextField } from '@mui/material';

interface RegisterFormProps {
  agendaEvent: AgendaEventType;
}

export default function RegisterForm({ agendaEvent }: RegisterFormProps) {
  return (
    <div className="grid gap-3">
      <h1>
        {text(
          'Registration for ' + agendaEvent.titleEN,
          'Inschrijving voor ' + agendaEvent.titleNL
        )}
      </h1>
      <TextField fullWidth label={text('Field 1', 'Veld 1')} />
      <Button variant="contained" fullWidth>
        {text('Register', 'Inschrijven')}
      </Button>
    </div>
  );
}
