import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import GenericPage from './GenericPage';
import AcceptingMembers from '../components/members/AcceptingMembers.tsx';
import MembersTable from '../components/members/MembersTable.tsx';
import {isAdminOrBoard} from '../util.ts';

export default function Members() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <GenericPage>
      {isAdminOrBoard(user) && (
        <AcceptingMembers
          expanded={expanded}
          toggleExpand={toggleExpand}
        />
      )}
      <MembersTable />
    </GenericPage>
  );
}
