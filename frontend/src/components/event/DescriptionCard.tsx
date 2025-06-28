import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLabel } from '../../util.ts';
import { Chip } from '@mui/material';
import ContentCard from '../ContentCard.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import {EventType, Language, WeekendType} from '../../types.ts';

interface DescriptionCardProps {
  descriptionMarkdown: Language;
  gear: Language;
  experience: WeekendType[];
  worga: string;
  category: EventType;
}

export default function DescriptionCard({
  descriptionMarkdown,
  gear,
  experience,
  worga,
  category
}: DescriptionCardProps) {
  const { text, language } = useLanguage();
  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      <div className="p-7">
        <Markdown remarkPlugins={[remarkGfm]}>
          {text(descriptionMarkdown.en, descriptionMarkdown.nl)}
        </Markdown>
      </div>
      {(gear.en?.length > 0 || gear.nl?.length > 0 || experience.length > 0) && (
        <div
          className="xl:flex grid gap-2.5 justify-between px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
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
      )}

    </ContentCard>
  );
}
