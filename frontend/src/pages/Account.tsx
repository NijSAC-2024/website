import GenericPage from './GenericPage.tsx';
import AccountDetails from '../components/account/AccountDetails.tsx';
import ChangePassword from '../components/account/ChangePassword.tsx';
import MyRegistrations from '../components/account/MyRegistrations.tsx';
import MyCommittees from '../components/account/MyCommittees.tsx';

export default function Account() {
  return (
    <GenericPage>
      <AccountDetails />
      <ChangePassword />
      <MyRegistrations />
      <MyCommittees />
    </GenericPage>
  );
}
