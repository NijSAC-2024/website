import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useLanguage } from '../providers/LanguageProvider';
import GenericPage from './GenericPage';
import ContentCard from '../components/ContentCard';
import AcceptingMembers from '../components/members/AcceptingMembers.tsx';
import MembersTable from '../components/members/MembersTable.tsx';

export default function Members() {
  const { user } = useAuth();
  const { text } = useLanguage();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <GenericPage>
      <ContentCard className="grid gap-4 p-7">
        {user?.roles.includes('admin') && (
          <AcceptingMembers
            expanded={expanded}
            toggleExpand={toggleExpand}
          />
        )}

        <h1 className="text-3xl">{text('All members', 'Alle leden')}</h1>
        <MembersTable
          expanded={expanded}
          toggleExpand={toggleExpand}
        />
      </ContentCard>
    </GenericPage>
  );
}
