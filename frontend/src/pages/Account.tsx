import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import TextCard from '../components/TextCard.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {getLabel} from '../util.ts';

export default function Settings() {
  const { text } = useLanguage()
  const { user } = useAuth()

  return (
    <GenericPage>
      <ContentCard className="p-7">
        <h1 className="text-3xl">{text('My account', 'Mijn account')}</h1>
        <TextCard className="px-6 py-3 mt-3 grid grid-cols-4 gap-5">
          <h2 className="col-span-4">{text('Personal information', 'Persoonlijke informatie')}</h2>

          <b>{text('Full name', 'Volledige naam')}</b>
          <span className="col-span-3">
            {`${user?.firstName} ${user?.infix ?? ''} ${user?.lastName}`}
          </span>

          <b>{text('Phone number', 'Telefoonnummer')}</b>
          <span className="col-span-3">{user?.phone}</span>

          <b>{text('Email', 'E-mailadres')}</b>
          <span className="col-span-3">{user?.email}</span>

          <b>{text('Student number', 'Studentnummer')}</b>
          <span className="col-span-3">{user?.studentNumber}</span>

          <b>{text('NKBV number', 'NKBV nummer')}</b>
          <span className="col-span-3">{user?.nkbvNumber}</span>

          <b>{text('Sportscard number', 'Sportkaartnummer')}</b>
          <span className="col-span-3">{user?.sportcardNumber}</span>

          <b>{text('Important information', 'Belangrijke informatie')}</b>
          <span className="col-span-3">{user?.importantInfo}</span>

          <b>{text('Membership status', 'Lidmaatschapsstatus')}</b>
          <span className="col-span-3">{text(user ? getLabel(user?.status) : '')}</span>
        </TextCard>

        <TextCard className="px-6 py-3 mt-3 grid grid-cols-4 gap-5">

          <h2 className="col-span-4">{text('Contact information for emergencies', 'Contactinformatie voor noodgevallen')}</h2>

          <b>{text('ICE contact name', 'ICE contact naam')}</b>
          <span className="col-span-3">{user?.iceContactName}</span>

          <b>{text('ICE email', 'ICE e-mailadres')}</b>
          <span className="col-span-3">{user?.iceContactEmail}</span>

          <b>{text('ICE phone number', 'ICE telefoonnummer')}</b>
          <span className="col-span-3">{user?.iceContactPhone}</span>
        </TextCard>
      </ContentCard>
    </GenericPage>

  );
}
