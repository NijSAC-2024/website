import EditEvent from '../components/edit/EditEvent.tsx';
import { EventContent } from '../types.ts';

export default function AddEvent() {
  const now = new Date();
  const event: EventContent = {
    name: {
      en: 'New event',
      nl: 'Nieuwe activiteit',
    },
    dates: [{ start: now, end: now }],
    isPublished: false,
    requiredMembershipStatus: ['member'],
    eventType: 'activity',
    questions: [],
    location: '',
  };
  return <EditEvent eventContent={event} />;
}
