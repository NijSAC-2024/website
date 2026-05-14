import {useState} from 'react';
import {IconButton, Tooltip, Menu, MenuItem, Checkbox} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useUserHook} from '../../hooks/useUserHook.ts';
import {useCommitteeHook} from '../../hooks/useCommitteeHook.ts';
import {isAdminOrBoard, isChair} from '../../util.ts';
import AreYouSure from '../AreYouSure.tsx';
import {Committee} from '../../types.ts';
import {useParams} from 'react-router-dom';
import {useAuth} from '../../providers/AuthProvider.tsx';

export function ChangeCommittees() {
  const {text} = useLanguage();
  const params = useParams();
  const {useUser, useUserCommittees} = useUserHook();
  const {user} = useAuth()
  const currentUser = useUser(params.userId);
  const {
    useCommittees,
    addUserToCommittee,
    deleteUserFromCommittee,
  } = useCommitteeHook();
  const myCommittees = useUserCommittees(user?.id)
  const currentCommittees = useUserCommittees(params.userId)
  const committees = useCommittees()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const toggleDialog = () => setDialogOpen(prev => !prev);

  if (!user || !(isAdminOrBoard(user.roles) || committees?.some((c) => isChair(myCommittees ?? [], c.id)))) {
    return null;
  }

  const toggleCommittee = async (committeeId: string) => {
    if (!currentUser) {
      return;
    }

    const inCommittee = currentCommittees?.some(
      (c) => c.committeeId === committeeId && c.left == null,
    );

    if (inCommittee) {
      await deleteUserFromCommittee(committeeId, currentUser.id);
    } else {
      await addUserToCommittee(committeeId, currentUser.id);
    }

    setAnchorEl(null);
    toggleDialog();
  };

  return (
    <>
      <Tooltip title={text('Change committees', 'Wijzig commissies')}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <GroupIcon/>
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {committees?.map((committee) => {
          const inCommittee = currentCommittees?.some(
            (c) => c.committeeId === committee.id && c.left == null,
          );

          return (
            (isAdminOrBoard(user.roles) || isChair(myCommittees ?? [], committee.id)) && (
              <MenuItem key={committee.id} onClick={() => {
                setSelectedCommittee(committee);
                toggleDialog()
              }}>
                <Checkbox checked={inCommittee} size="small"/>
                {text(committee.name)}
              </MenuItem>
            )
          );
        })}
      </Menu>

      <AreYouSure open={dialogOpen} onConfirm={() => toggleCommittee(selectedCommittee!.id)}
        onCancel={toggleDialog}
        message={`${text('You are about to ', 'Je staat op het punt om deze gebruiker ')}${currentCommittees?.some(
          (c) => c.committeeId === selectedCommittee?.id && c.left == null) ? text('remove this user from the ', 'te verwijderen van ') : text('add this user to the ', 'toe te voegen aan ')}${selectedCommittee ? text(selectedCommittee.name) : ''}.`}/>
    </>
  );
}
