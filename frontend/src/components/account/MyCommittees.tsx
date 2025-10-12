import { useLanguage } from '../../providers/LanguageProvider';
import { useApiState } from '../../providers/ApiProvider';
import ContentCard from '../ContentCard';
import { useAppState } from '../../providers/AppStateProvider.tsx';
import moment from 'moment';
import {getLabel} from '../../util.ts';

export default function MyCommittees() {
  const { text } = useLanguage();
  const { userCommittees, committees } = useApiState();
  const { navigate } = useAppState();

  if (!committees || !userCommittees) {
    return <></>;
  }

  return (
    <>
      <ContentCard className="mt-5">
        <h1>{text('My committees', 'Mijn commissies')}</h1>
      </ContentCard>

      <div className="grid xl:grid-cols-3 gap-5 mt-5">
        {userCommittees.filter((uc, index, self) =>
          index === self.findIndex(m => m.committeeId === uc.committeeId)
        ).map((userCommittee) => {
          const committee = committees.find(c => c.id === userCommittee.committeeId);
          if (!committee) {return null;}

          let imageUrl = '/images/test-header-image.jpg';
          if (committee.image) {
            imageUrl = committee.image.startsWith('https://')
              ? committee.image
              : `/api/file/${committee.image}`;
          }

          return (
            <div
              key={userCommittee.id}
              onClick={() => navigate('committee', { id: committee.id })}
              className="hover:cursor-pointer w-full rounded-2xl bg-inherit border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] h-full"
            >
              <img
                className="w-full aspect-[4/2] object-cover"
                src={imageUrl}
                alt={text('not available', 'niet beschikbaar')}
              />
              <div className="p-5 grid gap-1">
                <h1 className="text-3xl font-bold">
                  {text(committee.name?.en, committee.name?.nl)}
                </h1>

                {/* Display history for current user */}
                <div className="grid gap-1 mt-2">
                  {userCommittees
                    .filter(uc => uc.committeeId === committee.id)
                    .map((uc, i) => (
                      <i className="italic text-sm" key={i}>
                        {`${uc.role !== 'member' ? text(getLabel(uc.role)) + ': ' : ''}${moment(uc.joined).format('DD MMM YYYY')} - ${uc.left ? moment(uc.left).format('DD MMM YYYY') : text('today', 'heden')}`}
                      </i>
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
