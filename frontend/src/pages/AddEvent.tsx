import React from 'react';
import EditEvent from '../components/edit/EditEvent.tsx';
import { ActivityContent } from '../types.ts';

export default function AddEvent() {
  const now = new Date();
  const activity: ActivityContent = {
    name: {
      en: 'New activity',
      nl: 'Nieuwe activiteit'
    },
    dates: [{ start: now, end: now }],
    isPublished: false,
    requiredMembershipStatus: ['member'],
    activityType: 'activity',
    questions: [],
    location: ''
  };
  return <EditEvent activityContent={activity} />;
}
