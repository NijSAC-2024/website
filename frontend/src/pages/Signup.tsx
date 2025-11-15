import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import SignupForm from '../components/signup/SignupForm.tsx';
import { Button, Chip, Collapse } from '@mui/material';
import { useState } from 'react';
import SignupOptions from '../components/signup/SingupOptions.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import {MembershipStatus, UserContent} from '../types.ts';
import {useWebsite} from '../hooks/useState.ts';

interface MembershipType {
  id: MembershipStatus;
  label: {en: string, nl: string}
}

export default function Signup() {
  const { text } = useLanguage();
  const { createUser } = useApiState()
  const {navigate} = useWebsite()
  const [membership, setMembership] = useState<MembershipType>({
    id: 'member', label: {en: 'Member', nl: 'Lid'}
  });
  const [selectedMembership, setSelectedMembership] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<UserContent>({
    firstName: '',
    lastName: '',
    phone: '',
    iceContactName: '',
    iceContactEmail: '',
    iceContactPhone: '',
    email: '',
    password: '',
    nkbvNumber: 0,
    sportcardNumber: 0,
    studentNumber: 0,
    status: 'pending'
  });

  const handleSubmit = () => {
    createUser(newUser);
    navigate('events');
  };

  const handleChange = (field: keyof UserContent, value: string | number) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleExtraordinaryMember = () => {
    setMembership({id: 'affiliated', label: {en: 'Affiliated', nl: 'Aangeslotene'}});
    setSelectedMembership(true);
  };
  const handleMember = () => {
    setMembership({id: 'member', label: {en: 'Member', nl: 'Lid'}});
    setSelectedMembership(true);
  };
  const handleDonor = () => {
    setMembership({id: 'donor', label: { en: 'Donor', nl: 'Donateur' }});
    setSelectedMembership(true);
  };
  const handleChangeMembership = () => {
    setSelectedMembership(false);
  };
  return (
    <GenericPage>
      <ContentCard>
        <div className="px-7 pt-7 pb-5">
          <h1>
            {text('Register for the NijSAC', 'Inschrijven bij de NijSAC')}
          </h1>
          <Collapse in={selectedMembership} timeout="auto" unmountOnExit>
            <div className="pt-3 flex items-center gap-1">
              <Chip
                label={
                  text(
                    'Selected membership: ',
                    'Geselecteerd lidmaatschap: '
                  ) + text(membership.label)
                }
                color="primary"
              />
              <div className=""></div>
              <Button onClick={handleChangeMembership}>
                {text('Change', 'Verander')}
              </Button>
            </div>
          </Collapse>
          <Collapse in={!selectedMembership} timeout="auto" unmountOnExit>
            <SignupOptions
              handleMember={handleMember}
              handleExtraordinaryMember={handleExtraordinaryMember}
              handleDonor={handleDonor}
            />
          </Collapse>
        </div>
        <Collapse in={selectedMembership} timeout="auto" unmountOnExit>
          <div className="px-7 pt-5 pb-7 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <SignupForm newUser={newUser} handleChange={handleChange} handleSubmit={handleSubmit} />
          </div>
        </Collapse>
      </ContentCard>
    </GenericPage>
  );
}
