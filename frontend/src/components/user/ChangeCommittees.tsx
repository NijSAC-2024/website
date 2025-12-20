import {useState} from 'react';
import {IconButton, Tooltip, Menu, MenuItem, Checkbox} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useUsers} from '../../hooks/useUsers.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';
import {isAdminOrBoard, isChair} from '../../util.ts';

export function ChangeCommittees() {
  const {text} = useLanguage();
  const {user, currentUser} = useUsers();
  const {
    myCommittees,
    currentCommittees,
    committees,
    addUserToCommittee,
    deleteUserFromCommittee,
  } = useCommittees();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  if (!user || !(isAdminOrBoard(user.roles) || committees.some((c) => isChair(myCommittees, c.id)))) {
    return null;
  }

  const toggleCommittee = async (committeeId: string) => {
    if (!currentUser) {
      return;
    }

    const inCommittee = currentCommittees.some(
      (c) => c.committeeId === committeeId && c.left == null,
    );

    if (inCommittee) {
      await deleteUserFromCommittee(committeeId, currentUser.id);
    } else {
      await addUserToCommittee(committeeId, currentUser.id);
    }

    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={text('Change committees', 'Wijzig commissies')}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <GroupIcon/>
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {committees.map((committee) => {
          const inCommittee = currentCommittees.some(
            (c) => c.committeeId === committee.id && c.left == null,
          );

          return (
            (isAdminOrBoard(user.roles) || isChair(myCommittees, committee.id)) && (
              <MenuItem key={committee.id} onClick={() => toggleCommittee(committee.id)}>
                <Checkbox checked={inCommittee} size="small"/>
                {text(committee.name)}
              </MenuItem>
            )
          );
        })}
      </Menu>
    </>
  );
}
