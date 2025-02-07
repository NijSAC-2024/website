import React from 'react';
import EditEvent from '../components/edit/EditEvent.tsx';
import { ActivityContent } from '../types.ts';

export default function AddEvent() {
  const activity: ActivityContent = {
    name: {
      en: 'New activity',
      nl: 'Nieuwe activiteit'
    },
    dates: [],
    isPublished: false,
    requiredMembershipStatus: ['member'],
    activityType: 'activity',
    questions: [],
    location: ''
  };
  return <EditEvent activityContent={activity} />;
}
