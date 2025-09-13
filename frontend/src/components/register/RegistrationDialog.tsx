import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import {Answer, Language, Question, Registration, User} from '../../types.ts';
import RegisterForm from './RegisterForm.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface RegistrationDialogProps {
  open: boolean;
  toggleDialog: () => void;
  name: Language;
  questions: Question[];
  selectedRegistration: Registration | null;
  selectedUser: User | null;
  handleRegistration: (answers: Answer[], registrationId?: string, userId?: string, waitingListPosition?: number) => void;
  handleDeregisterClick: () => void;
}

export default function RegistrationDialog({
  open,
  toggleDialog,
  name,
  questions,
  selectedRegistration,
  selectedUser,
  handleRegistration,
  handleDeregisterClick,
}: RegistrationDialogProps) {
  const { text } = useLanguage();

  if (!selectedRegistration && !selectedUser) {
    return;
  }

  return (
    <Dialog open={open} onClose={toggleDialog} fullWidth>
      <DialogContent>
        <div className="grid gap-2">
          <h1>{`${text('Registration for', 'Inschrijving voor')} ${text(name)}`}</h1>
          <p className="mt-[-0.7em] mb-1">
            {`${text('of', 'van')} ${selectedRegistration?.firstName || selectedUser?.firstName} ${(selectedRegistration?.infix || selectedUser?.infix) ?? ''} ${selectedRegistration?.lastName || selectedUser?.lastName}`}
          </p>
          <RegisterForm
            registrationQuestions={questions}
            handleRegistration={(answers: Answer[]) =>
              handleRegistration(answers, selectedRegistration?.registrationId, selectedUser?.id, selectedRegistration?.waitingListPosition)
            }
            existingAnswers={selectedRegistration?.answers}
          />
        </div>
      </DialogContent>
      <DialogActions>
        {!selectedUser ? (
          <div className="flex justify-between w-full">
            <Button color="error" variant="outlined" onClick={handleDeregisterClick}>
              {selectedRegistration?.waitingListPosition != undefined
                ? text('Deregister from queue', 'Uitschrijven van wachtlijst')
                : text('Deregister', 'Uitschrijven')}
            </Button>
            <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
          </div>
        ) : (
          <Button onClick={toggleDialog}>{text('Close', 'Sluit')}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
