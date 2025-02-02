import { EventType } from '../types.ts';
import router from '../router.tsx';
import EditEvent from '../components/edit/EditEvent.tsx';

export default function AddEvent() {
  const handleUpdate = (updatedEvent: EventType) => {
    //Send to backend
    router.navigate('/agenda/' + updatedEvent.id);
  };

  const now = new Date();

  const event: EventType = {
    dates: [],
    hasMaxRegistration: false,
    isPublished: false,
    requiredMembershipStatus: [],
    id: '5',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png',
    title: { en: '', nl: '' },
    category: '',
    type: [],
    location: '',
    descriptionMarkdown: {
      en: '',
      nl: ''
    },
    gear: {
      en: '',
      nl: ''
    },
    experience: [],
    allowsRegistrations: false,
    numberOfRegistrations: 0,
    maxRegistrations: 0,
    registrationOpenTime: now.toISOString(),
    registrationCloseTime: now.toISOString(),
    registrationQuestions: []
  };
  return <EditEvent event={event} handleUpdate={handleUpdate} />;
}
