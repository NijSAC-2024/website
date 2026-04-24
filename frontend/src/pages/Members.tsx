import { useState } from 'react';
import GenericPage from './GenericPage';
import AcceptingMembers from '../components/members/AcceptingMembers.tsx';
import MembersTable from '../components/members/MembersTable.tsx';
import {isAdminOrBoard} from '../util.ts';
import {useAuth} from '../providers/AuthProvider.tsx';

export default function Members() {
  const {user} = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    return;
  }

  return (
    <GenericPage>
      {isAdminOrBoard(user.roles) && (
        <AcceptingMembers
          expanded={expanded}
          toggleExpand={toggleExpand}
        />
      )}
      <MembersTable />
    </GenericPage>
  );
}
