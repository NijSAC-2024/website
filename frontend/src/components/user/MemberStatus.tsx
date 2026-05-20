import {Alert} from '@mui/material';
import {useAuth} from '../../providers/AuthProvider.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';

const MemberAlert = () => {
  const {user} = useAuth();
  const {text} = useLanguage();

  if (!user || user.status === 'accepted') {
    return null;
  }
  if (user.status === 'pending') {
    return (
      <Alert severity="warning" variant="outlined">{text('Your account is not accepted yet, hence most features may still be disabled.', 'Je account is nog niet geaccepteerd, waardoor de meeste functionaliteiten zijn uitgeschakeld.')}</Alert>
    )
  }

  return (
    <Alert severity="error" variant="filled">{text('Your account has been rejected. Contact the board if you think this is a mistake.', 'Je account is afgewezen. Neem contact op met het bestuur als je denkt dat dit een fout is.')}</Alert>
  )
}

export default function MemberStatus() {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 w-[90%] xl:w-auto">
      {MemberAlert()}
    </div>
  )
}