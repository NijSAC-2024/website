import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import SignupForm from '../components/SignupForm.tsx';
import { text } from '../util.ts';
import { Button, Chip, Collapse } from '@mui/material';
import { useState } from 'react';
import SingupOptions from '../components/SingupOptions.tsx';

export default function Signup() {
  const [membership, setMembership] = useState<string | undefined>(undefined);

  const handleExtraordinaryMember = () => {
    setMembership('Extraordinary Member');
  };
  const handleMember = () => {
    setMembership('Member');
  };
  const handleDonor = () => {
    setMembership('Donor');
  };

  const handleChange = () => {
    setMembership(undefined);
  };
  return (
    <GenericPage>
      <ContentCard>
        <div className="px-7 pt-7 pb-5">
          <h1>{text('Register for the NijSAC', 'Inschrijven bij de NijSAC')}</h1>
          <Collapse in={!!membership} timeout="auto" unmountOnExit>
            <div className="pt-3 flex items-center">
              <Chip
                label={text('Selected membership: ', 'Geselecteerd lidmaatschap: ') + membership}
                color="primary"
              />
              <Button onClick={handleChange}>{text('Change', 'Verander')}</Button>
            </div>
          </Collapse>
          <Collapse in={!membership} timeout="auto" unmountOnExit>
            <SingupOptions
              handleMember={handleMember}
              handleExtraordinaryMember={handleExtraordinaryMember}
              handleDonor={handleDonor}
            />
          </Collapse>
        </div>
        <Collapse in={!!membership} timeout="auto" unmountOnExit>
          <div className="px-7 pt-5 pb-7 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
            <SignupForm />
          </div>
        </Collapse>
      </ContentCard>
    </GenericPage>
  );
}
