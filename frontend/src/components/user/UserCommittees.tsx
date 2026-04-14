import {useLanguage} from '../../providers/LanguageProvider';
import ContentCard from '../ContentCard';
import moment from 'moment';
import {getLabel} from '../../util.ts';
import {useState} from 'react';
import {Switch} from '@mui/material';
import {useWebsite} from '../../hooks/useState.ts';
import {useUsers} from '../../hooks/useUsers.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';

export default function UserCommittees() {
  const {text} = useLanguage();
  const {user} = useUsers();
  const [filterLeftCommittees, setFilterLeftCommittees] = useState<boolean>(false);
  const {navigate, state: {routerState: {params}}} = useWebsite();
  const {committees, currentCommittees} = useCommittees();

  if (!committees || !currentCommittees || !user) {
    return null;
  }

  const filteredCommittees = currentCommittees.filter((uc) => uc.left == null || filterLeftCommittees);

  return (
    <>
      <ContentCard className="mt-5">
        <div className="grid xl:grid-cols-2 justify-between">
          <h1>{params.user_id === user.id ? text('My committees', 'Mijn commissies') : text('Committees', 'Commissies')}</h1>
          <div className="flex items-center xl:justify-end">
            <p>{text('Include left committees', 'Uitgetreden commissies meenemen')}</p>
            <Switch
              checked={filterLeftCommittees}
              onChange={(_, checked) => setFilterLeftCommittees(checked)}
            />
          </div>
        </div>
      </ContentCard>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
        {filteredCommittees.filter((uc, index, self) =>
          index === self.findIndex(m => m.committeeId === uc.committeeId)
        ).map((userCommittee, index) => {
          const committee = committees.find(c => c.id === userCommittee.committeeId);
          if (!committee) {
            return null;
          }

          return (
            <div
              key={index}
              onClick={() => navigate('committees.committee', {committee_id: committee.id})}
              className="hover:cursor-pointer w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] h-full"
            >
              <div className="p-5 grid gap-1">
                <h1 className="text-3xl font-bold">
                  {text(committee.name?.en, committee.name?.nl)}
                </h1>

                {/* Display history for current user */}
                <div className="grid gap-1">
                  {currentCommittees
                    .filter(uc => uc.committeeId === committee.id)
                    .map((uc, i) => (
                      <p className="italic" key={i}>
                        {`${uc.role !== 'member' ? text(getLabel(uc.role)) + ': ' : ''}${moment(uc.joined).format('DD MMM YYYY')} - ${uc.left ? moment(uc.left).format('DD MMM YYYY') : text('today', 'heden')}`}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
