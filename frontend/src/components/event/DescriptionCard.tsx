import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLabel, text } from '../../util.ts';
import { Chip } from '@mui/material';
import ContentCard from '../ContentCard.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { AgendaEventType } from '../../types.ts';

interface DescriptionCardProps {
  agendaEvent: AgendaEventType;
}
export default function DescriptionCard({ agendaEvent }: DescriptionCardProps) {
  const { getLangCode } = useLanguage();
  const langCode = getLangCode();
  return (
    <ContentCard className="xl:col-span-2 flex flex-col justify-between">
      <div className="p-7">
        <Markdown remarkPlugins={[remarkGfm]}>
          {text(agendaEvent.descriptionMarkdown.en, agendaEvent.descriptionMarkdown.nl)}
        </Markdown>
      </div>
      <div className="flex justify-between px-7 py-5 border-t border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        {(agendaEvent.gear.en.length > 0 || agendaEvent.gear.nl.length > 0) && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Necessary Gear', 'Benodigde Uitrusting')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {langCode === 'en'
                ? agendaEvent.gear.en
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
                : agendaEvent.gear.nl
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
        {agendaEvent.experience.length > 0 && (
          <div>
            <b className="text-[#1976d2] dark:text-[#90caf9]">
              {text('Necessary Experience', 'Benodigde Ervaring')}
            </b>
            <div className="flex flex-wrap gap-1 mt-1">
              {agendaEvent.experience.map((experience, index) => (
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
