import {useLanguage} from '../providers/LanguageProvider.tsx';
import {Button, Fab, Table, TableBody, TableCell, TableRow} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import {BasicUser} from '../types.ts';
import {isAdminOrBoard} from '../util.ts';
import {useWebsite} from '../hooks/useState.ts';
import {useUsers} from '../hooks/useUsers.ts';
import {useCommittees} from '../hooks/useCommittees.ts';

export default function Committee() {
  const {text} = useLanguage();
  const {navigate} = useWebsite();
  const {user} = useUsers();
  const {myCommittees, committee, committeeMembers} = useCommittees();

  if (!committee) {
    return <></>;
  }

  let imageUrl = '/images/test-header-image.jpg';
  if (committee.image) {
    imageUrl = (committee.image?.startsWith('https://') ? committee.image : `/api/file/${committee.image}`);
  }

  return (
    <>
      {user && ((myCommittees.some(uc => uc.committeeId === committee.id && uc.role === 'chair' && uc.left == null)) || isAdminOrBoard(user)) && (
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
                  {committeeMembers.map((member: BasicUser) => (
                    <TableRow
                      key={member.id}
                      sx={{'&:last-child td, &:last-child th': {border: 0}}}
                    >
                      <TableCell component="th" scope="row">
                        <p className="hover:cursor-pointer hover:opacity-60 transition-all duration-100"
                          onClick={() => navigate('user', {user_id: member.id})}>{`${member.firstName} ${member.infix ?? ''} ${member.lastName}`}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ContentCard>
          )}
        </div>
      </GenericPage>
    </>
  );
}
