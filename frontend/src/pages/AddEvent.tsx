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
    dates: [{ startDateTime: now.toISOString(), endDateTime: now.toISOString() }],
    hasMaxRegistration: false,
    isPublished: false,
    requiredMembershipStatus: ['member'],
    id: '5',
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
