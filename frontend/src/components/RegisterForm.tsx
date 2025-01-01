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
          'Registration for ' + agendaEvent.title.en,
          'Inschrijving voor ' + agendaEvent.title.nl
        )}
      </h1>
      {agendaEvent.registrationFields.map((field, index) => (
        <TextField key={index} fullWidth label={text(field.en, field.nl)} />
      ))}
      <Button variant="contained" fullWidth>
        {text('Register', 'Inschrijven')}
      </Button>
    </div>
  );
}
