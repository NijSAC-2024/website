import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLabel } from '../../util.ts';
import { Chip } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {EventType, Language, WeekendType} from '../../types.ts';
import {useWebsite} from '../../hooks/useState.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';

interface DescriptionCardProps {
  descriptionMarkdown: Language;
  gear: Language;
  experience: WeekendType[];
  worga: string;
  category: EventType;
  createdBy?: string;
}

export default function DescriptionCard({
  descriptionMarkdown,
  gear,
  experience,
  worga,
  category,
  createdBy,
}: DescriptionCardProps) {
  const { text, language } = useLanguage();
  const { committees } = useCommittees();
  const {navigate} = useWebsite()
  return (
    <div className="xl:col-span-2 flex flex-col justify-between w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]">
      <div className="p-5 xl:p-7">
        <Markdown remarkPlugins={[remarkGfm]}>
          {text(descriptionMarkdown.en, descriptionMarkdown.nl)}
        </Markdown>
      </div>
      <div
        className="xl:flex grid grid-cols-2 gap-2.5 justify-between p-3.5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <div>
          <b className="text-[#1976d2] dark:text-[#90caf9]">
            {text('Organised by', 'Geörganiseerd door')}
          </b>
          <div>
            <Chip
              label={text(committees.find(c => c.id === createdBy)?.name || {en: '', nl: ''})}
              className="uppercase font-semibold"
              size="small"
              onClick={() => navigate('committees.committee', {committee_id: createdBy!})}
            />
          </div>
        </div>
        {(gear.en?.length > 0 || gear.nl?.length > 0) && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Necessary Gear', 'Benodigde Uitrusting')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {language === 'en'
                ? gear.en?.split(',').map((item) => item.trim()).map((gear, index) => (
                  <Chip
                    key={index}
                    label={gear}
                    className="uppercase font-semibold"
                    size="small"
                  />
                ))
                : gear.nl?.split(',').map((item) => item.trim()).map((gear, index) => (
                  <Chip
                    key={index}
                    label={gear}
                    className="uppercase font-semibold"
                    size="small"
                  />
                ))}
            </div>
          </div>
        )}
        {experience.length > 0 && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Necessary Experience', 'Benodigde Ervaring')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {experience.map((experience, index) => (
                <Chip
                  key={index}
                  label={text(getLabel(experience))}
                  className="uppercase font-semibold"
                  size="small"
                />
              ))}
            </div>
          </div>
        )}
        {category === 'weekend' && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Weekend Organiser', 'Worga')}
            </b>
            <div>
              <Chip
                label={worga === 'nobody' ? text('No one assigned', 'Niemand toegewezen') : worga}
                className="uppercase font-semibold"
                size="small"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
