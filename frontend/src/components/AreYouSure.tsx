import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { text } from '../util.ts';

interface AreYouSureProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AreYouSure({
  open,
  title = text('Are you sure?', 'Weet je het zeker?'),
  message = text('Do you really want to proceed?', 'Wil je echt doorgaan?'),
  onConfirm,
  onCancel
}: AreYouSureProps) {
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
