import { Dispatch, SetStateAction, useState } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useAlert } from '../providers/AlertProvider.tsx';
import PasswordInput from './PasswordInput.tsx';

export default function LoginForm({
  onClose,
  setLoading
}: {
  onClose: () => void;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { login } = useAuth();
  const { changeAlert } = useAlert();
  const [email, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async () => {
    if (email === '' || password === '') {
      changeAlert({
        title: 'Invalid credentials',
        text: 'Please fill in email and password.',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      switch (response.status) {
        case 200:
          const token: string = await response.json();
          login({ token });
          onClose();
          changeAlert({
            title: 'Success',
            text: 'You logged in.',
            severity: 'success'
          });
          break;
        case 401:
          changeAlert({
            title: 'Incorrect username or password',
            text: 'Did you spell everything correctly?',
            severity: 'error'
          });
          break;
        case 500:
          changeAlert({
            title: 'Internal Server Error',
            text: 'Something went wrong. Please try again later.',
            severity: 'error'
          });
          break;
        default:
          changeAlert({
            title: 'Error',
            text: 'Something went wrong. Please try again later.',
            severity: 'error'
          });
      }
    } catch (error) {
      changeAlert({
        title: 'Error: ' + error,
        text: 'Are you connected to the internet?',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 grid-flow-row gap-2">
        <div className="flex justify-between">
          <p className="text-2xl">Log In</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <TextField
          fullWidth
          id="email"
          label="Email"
          value={email}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordInput setPassword={setPassword} />
        <Button variant="contained" onClick={handleSubmit}>
          Log In
        </Button>
      </div>
    </>
  );
}
