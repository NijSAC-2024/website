import {useLanguage} from '../providers/LanguageProvider.tsx';
import {Button, Fab, IconButton, Table, TableBody, TableCell, TableRow, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import {CommitteeUser} from '../types.ts';
import {getLabel, isAdminOrBoard, isChair} from '../util.ts';
import {useWebsite} from '../hooks/useState.ts';
import {useUsers} from '../hooks/useUsers.ts';
import {useCommittees} from '../hooks/useCommittees.ts';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AreYouSure from '../components/AreYouSure.tsx';
import {useState} from 'react';

export default function Committee() {
  const {text} = useLanguage();
  const {navigate} = useWebsite();
  const {user} = useUsers();
  const {committee, committeeMembers, makeChair} = useCommittees();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeUser | null>(null);

  const toggleDialog = () => setDialogOpen((prevState) => !prevState);

  if (!committee) {
    return <></>;
  }

  const handleMakeChair = async () => {
    await makeChair(committee.id, selectedMember!.id);
    toggleDialog();
  }

  let imageUrl = '/images/test-header-image.jpg';
  if (committee.image) {
    imageUrl = (committee.image?.startsWith('https://') ? committee.image : `/api/file/${committee.image}`);
  }

  return (
    <>
      {user && (isChair(committeeMembers, user.id)|| isAdminOrBoard(user.roles)) && (
        <div className="fixed bottom-5 right-5 z-10">
          <Fab
            variant="extended"
            color="primary"
            onClick={() => navigate('committees.committee.edit', {committee_id: committee.id})}
          >
            <EditIcon className="mr-2"/>
            {text('Edit committee', 'Commissie bewerken')}
          </Fab>
        </div>
      )}

      <GenericPage image={imageUrl}>
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-[-9.3rem]">
          <div className="lg:col-span-2 xl:col-span-3 mb-[-0.5rem] flex justify-between items-center">
            <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
              <Button color="inherit" onClick={() => navigate('committees')}>
                {text('Back to Committees', 'Terug naar Commissies')}
              </Button>
            </div>
          </div>

          {/* Committee Info */}
          <div
            className="w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] xl:col-span-2 xl:row-span-2 border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] h-full">
            <img
              className="w-full aspect-[4/2] object-cover"
              src={imageUrl}
              alt="not available"
            />
            <div className="p-5 grid gap-1">
              <h1 className="text-3xl font-bold">
                {text(committee.name?.en, committee.name.nl)}
              </h1>
              <Markdown remarkPlugins={[remarkGfm]}>
                {text(committee.description?.en || '', committee.description?.nl || '')}
              </Markdown>
            </div>
          </div>

          {/* Committee Members */}
          {user && (
            <ContentCard className="xl:col-span-1 h-full grid">
              <h2>{text('Members', 'Leden')}</h2>
              <Table>
                <TableBody>
                  {committeeMembers.map((member: CommitteeUser) => (
                    <TableRow
                      key={member.id}
                      sx={{'&:last-child td, &:last-child th': {border: 0}}}
                    >
                      <TableCell component="th" scope="row">
                        <div className="flex justify-between items-center">
                          <div className="grid hover:cursor-pointer hover:opacity-60 transition-all duration-100" onClick={() => navigate('user', {user_id: member.id})}>
                            <p>{`${member.firstName} ${member.infix ?? ''} ${member.lastName}`}</p>
                            {member.role === 'chair' && <i className="text-xs">{text(getLabel(member.role))}</i>}
                          </div>
                          {(isAdminOrBoard(user.roles) || isChair(committeeMembers, user.id)) && member.role !== 'chair' &&
                              <Tooltip title={text('Make chair of committee', 'Maak commissiehoofd')}>
                                <IconButton size="small" onClick={() => {setSelectedMember(member); toggleDialog()}}>
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
            </ContentCard>
          )}
        </div>
      </GenericPage>
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
  );
}
