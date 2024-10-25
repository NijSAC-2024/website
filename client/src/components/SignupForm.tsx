import { Dispatch, SetStateAction, useState } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAuth } from '../providers/AuthProvider.tsx';
import { useAlert } from '../providers/AlertProvider.tsx';
import PasswordInput from './PasswordInput.tsx';

export default function SignupForm({
  onClose,
  setLoading
}: {
  onClose: () => void;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { login } = useAuth();
  const { changeAlert } = useAlert();
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async () => {
    if (email === '' || firstName === '' || lastName === '' || password === '') {
      changeAlert({
        title: 'Invalid credentials',
        text: 'Please fill in everything.',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          first_name: firstName,
          last_name: lastName,
          password_hash: password
        })
      });
      switch (response.status) {
        case 201:
          const token: string = await response.json();
          login({ token });
          onClose();
          changeAlert({
            title: 'Success',
            text: 'Created account: ' + firstName + ' ' + lastName,
            severity: 'success'
          });
          break;
        case 403:
          changeAlert({
            title: "Couldn't create account",
            text: 'Try using a different username.',
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
          <p className="text-2xl">Sign Up</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <TextField
          id="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <TextField
          id="firstName"
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full"
        />
        <TextField
          id="lastName"
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full"
        />
        <PasswordInput setPassword={setPassword} />
        <Button variant="contained" onClick={handleSubmit}>
          Sign Up
        </Button>
      </div>
    </>
  );
}
