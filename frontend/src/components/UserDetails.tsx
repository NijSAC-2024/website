import { User } from '../types';
import { getLabel } from '../util';
import { useLanguage } from '../providers/LanguageProvider';

interface UserDetailsProps {
  user: User;
}

export default function UserDetails({ user }: UserDetailsProps) {
  const { text } = useLanguage();

  return (
    <div className="py-3 grid grid-cols-4 gap-3">
      <b>{text('Full name', 'Volledige naam')}</b>
      <span className="col-span-3">{`${user.firstName} ${user.infix ?? ''} ${user.lastName}`}</span>

      <b>{text('Phone number', 'Telefoonnummer')}</b>
      <span className="col-span-3">{user.phone}</span>

      <b>{text('Email', 'E-mailadres')}</b>
      <span className="col-span-3">{user.email}</span>

      <b>{text('Important information', 'Belangrijke informatie')}</b>
      <span className="col-span-3">{user.importantInfo}</span>

      <b>{text('Membership status', 'Lidmaatschapsstatus')}</b>
      <span className="col-span-3">{text(getLabel(user.status))}</span>

      <b>{text('Roles', 'Rollen')}</b>
      <span className="col-span-3">{user.roles.map((r) => text(getLabel(r))).join(', ')}</span>

      <b>{text('Student number', 'Studentnummer')}</b>
      <span className="col-span-3">{user.studentNumber}</span>

      <b>{text('Sportscard number', 'Sportkaartnummer')}</b>
      <span className="col-span-3">{user.sportcardNumber}</span>

      <b>{text('NKBV number', 'NKBV-nummer')}</b>
      <span className="col-span-3">{user.nkbvNumber}</span>

      <b>{text('ICE contact name', 'ICE contact naam')}</b>
      <span className="col-span-3">{user.iceContactName}</span>

      <b>{text('ICE email', 'ICE e-mailadres')}</b>
      <span className="col-span-3">{user.iceContactEmail}</span>

      <b>{text('ICE phone number', 'ICE telefoonnummer')}</b>
      <span className="col-span-3">{user.iceContactPhone}</span>
    </div>
  );
}
