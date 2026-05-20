import AreYouSure from '../AreYouSure.tsx';
import {useNavigate, useParams} from 'react-router-dom';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useAuth} from '../../providers/AuthProvider.tsx';
import {useCommitteeHook} from '../../hooks/useCommitteeHook.ts';
import {useState} from 'react';
import {CommitteeUser} from '../../types.ts';
import ContentCard from '../ContentCard.tsx';
import {IconButton, Table, TableBody, TableCell, TableRow, Tooltip} from '@mui/material';
import {getLabel, isAdminOrBoard, isChair} from '../../util.ts';
import EventSeatIcon from '@mui/icons-material/EventSeat';

export default function CommitteeMembers() {
  const {text} = useLanguage();
  const {committeeId} = useParams();
  const {user} = useAuth();
  const {useCommitteeMembers, makeChair} = useCommitteeHook();
  const committeeMembers = useCommitteeMembers(committeeId)
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeUser | null>(null);
  if (!committeeId) {
    return null;
  }
  const toggleDialog = () => setDialogOpen((prevState) => !prevState);
  const handleMakeChair = async () => {
    await makeChair(committeeId, selectedMember!.id);
    toggleDialog();
  }

  return (
    <>
      {user && (
        <ContentCard className="xl:col-span-1 h-full">
          <div className="flex flex-col justify-start">
            <h2>{text('Members', 'Leden')}</h2>
            <Table>
              <TableBody>
                {committeeMembers?.map((member: CommitteeUser) => (
                  <TableRow
                    key={member.id}
                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                  >
                    <TableCell component="th" scope="row">
                      <div className="flex justify-between items-center">
                        <div
                          className="grid hover:cursor-pointer hover:opacity-60 transition-all duration-100"
                          onClick={() => navigate(`/user/${member.id}`)}>
                          <p>{`${member.firstName} ${member.infix ?? ''} ${member.lastName}`}</p>
                          {member.role === 'chair' &&
                          <i className="text-xs">{text(getLabel(member.role))}</i>}
                        </div>
                        {(isAdminOrBoard(user.roles) || isChair(committeeMembers, user.id)) && member.role !== 'chair' &&
                        <Tooltip
                          title={text('Make chair of committee', 'Maak commissiehoofd')}>
                          <IconButton size="small" onClick={() => {
                            setSelectedMember(member);
                            toggleDialog()
                          }}>
                            <EventSeatIcon/>
                          </IconButton>
                        </Tooltip>
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ContentCard>
      )}
      <AreYouSure
        open={dialogOpen}
        onCancel={toggleDialog}
        onConfirm={handleMakeChair}
        message={text(
          'You are about to make this user the chair of the committee.',
          'Je staat op het punt deze gebruiker hoofd te maken van de commissie.'
        )}
      />
    </>
  )
}