import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { text } from '../util.ts';
import { useLanguage } from '../providers/LanguageProvider.tsx';

interface AreYouSureProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AreYouSure({ open, title, message, onConfirm, onCancel }: AreYouSureProps) {
  const { language: lang } = useLanguage();

  if (!title) {
    title = text(lang, 'Are you sure?', 'Weet je het zeker?');
  }
  if (!message) {
    message = text(lang, 'Do you really want to proceed?', 'Wil je echt doorgaan?');
  }

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <p>{message}</p>
        <div className="flex justify-between mt-3">
          <Button onClick={onCancel} color="primary" variant="contained">
            Cancel
          </Button>
          <Button onClick={onConfirm} color="error" variant="outlined">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
