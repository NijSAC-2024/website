import {Collapse, IconButton, Tooltip} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TextCard from '../../components/TextCard';
import { useLanguage } from '../../providers/LanguageProvider';
import { useApiState } from '../../providers/ApiProvider';
import UserDetails from '../UserDetails.tsx';

interface AcceptingMembersProps {
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
}

export default function AcceptingMembers({
  expanded,
  toggleExpand
}: AcceptingMembersProps) {
  const { text } = useLanguage();
  const { users, updateUser } = useApiState()

  const pendingUsers = users.filter((u) => u.status === 'pending');

  return (
    <div>
      <h1 className="text-2xl">{text('Pending members', 'Goed te keuren leden')}</h1>
      {pendingUsers.length === 0 ? (
        <p className="mt-2">{text('No pending members', 'Geen leden om goed te keuren')}</p>
      ) : (
        <div className="mt-2 grid gap-3"> {
          pendingUsers.map((u) => (
            <TextCard key={u.id} className="px-6 py-3">
              <div className="lg:flex items-center justify-between">
                <div>
                  <p className="font-medium">{`${u.firstName} ${u.infix ?? ''} ${u.lastName}`}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip title={expanded[u.id] ? text('Less info', 'Minder info') : text('More info', 'Meer info')}>
                    <IconButton onClick={() => toggleExpand(u.id)}>
                      {expanded[u.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={text('Accept', 'Accepteer')}>
                    <IconButton
                      color="success"
                      onClick={() => updateUser(u.id, { ...u, status: 'member' })}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={text('Deny', 'Wijs af')}>
                    <IconButton
                      color="error"
                      onClick={() => updateUser(u.id, { ...u, status: 'pending' })}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
              <Collapse in={expanded[u.id]} timeout="auto" unmountOnExit>
                <UserDetails user={u}/>
              </Collapse>
            </TextCard>
          ))
        }
        </div>
      )}
    </div>
  );
}
