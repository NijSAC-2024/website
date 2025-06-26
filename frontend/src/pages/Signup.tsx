import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import SignupForm from '../components/signup/SignupForm.tsx';
import { Button, Chip, Collapse } from '@mui/material';
import { useState } from 'react';
import SignupOptions from '../components/signup/SingupOptions.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';
import {MembershipStatus, UserContent} from '../types.ts';
import {useApiState} from '../providers/ApiProvider.tsx';

interface MembershipType {
  id: MembershipStatus;
  label: {en: string, nl: string}
}

export default function Signup() {
  const { text } = useLanguage();
  const { createUser } = useApiState()
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
    status: 'pending',
  });

  const handleSubmit = () => {
    createUser(newUser);
  };

  const handleChange = (field: keyof UserContent, value: string | number) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleExtraordinaryMember = () => {
    setMembership({id: 'extraordinary', label: {en: 'Extraordinary Member', nl: 'Buitengewoon Lid'}});
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

  const handleNonMeber = () => {
    setMembership({id: 'nonMember', label: { en: 'Introduction', nl: 'Introducee' }});
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
              handleNonMember={handleNonMeber}
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
