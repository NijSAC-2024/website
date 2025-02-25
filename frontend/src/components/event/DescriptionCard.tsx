import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLabel, text } from '../../util.ts';
import { Chip } from '@mui/material';
import ContentCard from '../ContentCard.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { Language, WeekendType } from '../../types.ts';

interface DescriptionCardProps {
  descriptionMarkdown: Language;
  gear: Language;
  experience: WeekendType[];
}
export default function DescriptionCard({
  descriptionMarkdown,
  gear,
  experience
}: DescriptionCardProps) {
  const { language: lang } = useLanguage();
  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      <div className="p-7">
        <Markdown remarkPlugins={[remarkGfm]}>
          {text(lang, descriptionMarkdown.en, descriptionMarkdown.nl)}
        </Markdown>
      </div>
      <div className="flex justify-between px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        {(gear.en.length > 0 || gear.nl.length > 0) && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text(lang, 'Necessary Gear', 'Benodigde Uitrusting')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {lang === 'en'
                ? gear.en
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
                : gear.nl
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
        {experience.length > 0 && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text(lang, 'Necessary Experience', 'Benodigde Ervaring')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {experience.map((experience, index) => (
                <Chip
                  key={index}
                  label={text(lang, getLabel(experience))}
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
