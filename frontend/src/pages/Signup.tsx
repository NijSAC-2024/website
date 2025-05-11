import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import SignupForm from '../components/signup/SignupForm.tsx';
import { Button, Chip, Collapse } from '@mui/material';
import { useState } from 'react';
import SignupOptions from '../components/signup/SingupOptions.tsx';
import { useLanguage } from '../providers/LanguageProvider.tsx';

type MembershipTypeEN = 'Member' | 'Extraordinary Member' | 'Donor';
type MembershipTypeNL = 'Lid' | 'Buitengewoon Lid' | 'Donateur';

interface MembershipType {
  en: MembershipTypeEN;
  nl: MembershipTypeNL;
}

export default function Signup() {
  const { text } = useLanguage();
  const [membership, setMembership] = useState<MembershipType>({
    en: 'Member',
    nl: 'Lid'
  });
  const [selectedMembership, setSelectedMembership] = useState<boolean>(false);

  const handleExtraordinaryMember = () => {
    setMembership({ en: 'Extraordinary Member', nl: 'Buitengewoon Lid' });
    setSelectedMembership(true);
  };
  const handleMember = () => {
    setMembership({ en: 'Member', nl: 'Lid' });
    setSelectedMembership(true);
  };
  const handleDonor = () => {
    setMembership({ en: 'Donor', nl: 'Donateur' });
    setSelectedMembership(true);
  };

  const handleChange = () => {
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
                  ) + text(membership.en, membership.nl)
                }
                color="primary"
              />
              <div className=""></div>
              <Button onClick={handleChange}>
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
            <SignupForm />
          </div>
        </Collapse>
      </ContentCard>
    </GenericPage>
  );
}
