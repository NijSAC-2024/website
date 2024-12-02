import { Backdrop, CircularProgress, Dialog, DialogContent, Link } from '@mui/material';
import { useState } from 'react';
import SignupForm from './SignupForm.tsx';
import LoginForm from './LoginForm.tsx';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  const [login, setLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        {login ? (
          <LoginForm onClose={onClose} setLoading={setLoading} />
        ) : (
          <SignupForm onClose={onClose} setLoading={setLoading} />
        )}
        <p>
          {login ? (
            <>
              Don&#39;t have an account yet?{' '}
              <Link
                onClick={() => {
                  setLogin(false);
                }}
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Or{' '}
              <Link
                onClick={() => {
                  setLogin(true);
                }}
              >
                log in
              </Link>{' '}
              instead.
            </>
          )}
        </p>
        <Backdrop open={loading}>
          <CircularProgress />
        </Backdrop>
      </DialogContent>
    </Dialog>
  );
}
