import GenericPage from './GenericPage.tsx';
import UserDetails from '../components/user/UserDetails.tsx';
import ChangePassword from '../components/user/ChangePassword.tsx';
import UserRegistrations from '../components/user/UserRegistrations.tsx';
import UserCommittees from '../components/user/UserCommittees.tsx';

export default function User() {
  return (
    <GenericPage>
      <UserDetails />
      <ChangePassword />
      <UserRegistrations />
      <UserCommittees />
    </GenericPage>
  );
}
