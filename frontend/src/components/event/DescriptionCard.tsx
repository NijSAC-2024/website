import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLabel, text } from '../../util.ts';
import { Chip } from '@mui/material';
import ContentCard from '../ContentCard.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { EventType } from '../../types.ts';

interface DescriptionCardProps {
  event: EventType;
}
export default function DescriptionCard({ event }: DescriptionCardProps) {
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      <div className="p-7">
        <Markdown remarkPlugins={[remarkGfm]}>
          {text(event.descriptionMarkdown.en, event.descriptionMarkdown.nl)}
        </Markdown>
      </div>
      <div className="flex justify-between px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        {(event.gear.en.length > 0 || event.gear.nl.length > 0) && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Necessary Gear', 'Benodigde Uitrusting')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {langCode === 'en'
                ? event.gear.en
                    .split(',')
                    .map((item) => item.trim())
                    .map((gear, index) => (
                      <Chip
                        key={index}
                        label={gear}
                        className="uppercase font-semibold"
                        size="small"
                      />
                    ))
                : event.gear.nl
                    .split(',')
                    .map((item) => item.trim())
                    .map((gear, index) => (
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
        {event.experience.length > 0 && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Necessary Experience', 'Benodigde Ervaring')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {event.experience.map((experience, index) => (
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
      </div>
    </ContentCard>
  );
}
