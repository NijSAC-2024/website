import { text } from '../../util.ts';
import TextCard from '../TextCard.tsx';
import { Button, Divider } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface SingupOptionsProps {
  handleMember: () => void;
  handleExtraordinaryMember: () => void;
  handleDonor: () => void;
}

export default function SingupOptions({
  handleMember,
  handleExtraordinaryMember,
  handleDonor
}: SingupOptionsProps) {
  const { language: lang } = useLanguage();
  return (
    <>
      <p>
        {text(
          lang,
          'To register for the NijSAC, we have 3 different options, applicable in different situations.',
          'Om te registreren voor de NijSAC hebben we 3 verschillende opties, toepasbaar in verschillende situaties'
        )}
      </p>
      <div className="grid xl:grid-cols-2 gap-5 mb-2">
        <TextCard className="px-7 py-5 mt-5">
          <h2>{text(lang, 'Member', 'Lid')}</h2>
          <h3>{text(lang, 'Requirements:', 'Eisen:')}</h3>
          <div className="p-3">
            <ul className="list-disc ml-2">
              <li>
                {text(
                  lang,
                  'You are enrolled as student  or PhD at the Radboud University or Hogeschool van Arnhem en Nijmegen, or graduated at most a year ago at one of these educational institutions.',
                  'Je bent ingeschreven als student of doet een PhD aan Radboud Universiteit of de Hogeschool van Arnhem en Nijmegen, of je bent maximaal een jaar geleden van één van deze twee instanties afgestudeerd.'
                )}
              </li>
              <li>{text(lang, 'You are a member of the NKBV.', 'Je bent NKBV-lid.')}</li>
              <li>
                {text(
                  lang,
                  'You are insured for mountain sports.',
                  'Je bent verzekerd voor bergsporten.'
                )}
              </li>
            </ul>
          </div>
          <Divider />
          <div className="p-3">
            <ul className="list-disc ml-2">
              <li>
                {text(
                  lang,
                  'You own a yearly sports card at the Radboud Sports Center.',
                  'Je bezit een sportkaart voor het Radboud Sport Centrum.'
                )}
              </li>
              <li>
                {text(
                  lang,
                  'You are able to join in the NijSAC courses at the RSC.',
                  'Je mag meedoen aan NijSAC cursussen op het RSC.'
                )}
              </li>
            </ul>
          </div>
          <Divider />
          <p className="mt-3">
            {text(
              lang,
              'A membership costs 45 euros per year.',
              'Een lidmaatschap kost 45 euro per jaar.'
            )}
          </p>
          <div className="grid justify-items-end mt-5">
            <Button variant="contained" onClick={handleMember}>
              {text(lang, 'Register as member', 'Inschrijven als lid')}
            </Button>
          </div>
        </TextCard>
        <TextCard className="px-7 py-5 xl:mt-5">
          <h2>{text(lang, 'Extraordinary Member', 'Buitengewoon Lid')}</h2>
          <h3>{text(lang, 'Requirements:', 'Eisen:')}</h3>
          <div className="p-3">
            <ul className="list-disc ml-2">
              <li>
                {text(
                  lang,
                  'You are enrolled as student or PhD at the Radboud University or Hogeschool van Arnhem en Nijmegen, or graduated at most a year ago at one of these educational institutions.',
                  'Je bent ingeschreven als student of doet een PhD aan Radboud Universiteit of de Hogeschool van Arnhem en Nijmegen, of je bent maximaal een jaar geleden van één van deze twee instanties afgestudeerd.'
                )}
              </li>
              <li>{text(lang, 'You are a member of the NKBV.', 'Je bent NKBV-lid.')}</li>
              <li>
                {text(
                  lang,
                  'You are insured for mountain sports.',
                  'Je bent verzekerd voor bergsporten.'
                )}
              </li>
            </ul>
          </div>
          <Divider />
          <div className="p-3">
            <ul className="list-disc ml-2">
              <li>
                {text(
                  lang,
                  'You do not own a yearly sports card at the Radboud Sports Center.',
                  'Je bezit geen sportkaart voor het Radboud Sport Centrum.'
                )}
              </li>
              <li>
                {text(
                  lang,
                  'You are not able to join in the NijSAC courses at the RSC.',
                  'Je mag niet meedoen aan NijSAC cursussen op het RSC.'
                )}
              </li>
            </ul>
          </div>
          <Divider />
          <p className="mt-3">
            {text(
              lang,
              'A extraordinary membership costs 50 euros per year.',
              'Een buitengewoon lidmaatschap kost 50 euro per jaar.'
            )}
          </p>
          <div className="grid justify-items-end mt-5">
            <Button variant="contained" onClick={handleExtraordinaryMember}>
              {text(lang, 'Register as extraorinary member', 'Inschrijven als buitengewoon lid')}
            </Button>
          </div>
        </TextCard>
        <TextCard className="px-7 py-5 xl:col-span-2">
          <h2>{text(lang, 'Donor', 'Donateur')}</h2>
          <p>
            {text(
              lang,
              'By choosing this option, you are willing to donate 20 euros per year to the NijSAC without becoming a member. You will not be able to participate in any of the NijSAC\'s activities.',
              'Door voor deze optie te kiezen, bent u bereid 20 euro per jaar aan de NijSAC te doneren zonder lid te worden. U kunt dan aan geen van de activiteiten van de NijSAC deelnemen.'
            )}
          </p>
          <div className="grid justify-items-end mt-5">
            <Button variant="contained" onClick={handleDonor}>
              {text(lang, 'Register as donor', 'Inschrijven als donateur')}
            </Button>
          </div>
        </TextCard>
      </div>
    </>
  );
}
