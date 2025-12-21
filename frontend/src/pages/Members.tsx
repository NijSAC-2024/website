import { useState } from 'react';
import GenericPage from './GenericPage';
import AcceptingMembers from '../components/members/AcceptingMembers.tsx';
import MembersTable from '../components/members/MembersTable.tsx';
import {isAdminOrBoard} from '../util.ts';
import {useUsers} from '../hooks/useUsers.ts';
import {useWebsite} from '../hooks/useState.ts';

export default function Members() {
  const { user } = useUsers();
  const {navigate} = useWebsite();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    navigate('index');
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
