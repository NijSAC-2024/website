import { CategoryType, EventType, EventTypeApi, MembershipStatus, OptionType } from '../types.ts';

export function eventToApi(event: EventType): EventTypeApi {
  return {
    id: event.id,
    registrationCount: 0,
    waitingListCount: 0,
    nameNl: event.title.nl,
    nameEn: event.title.en,
    image: event.image || '',
    descriptionNl: event.descriptionMarkdown.nl,
    descriptionEn: event.descriptionMarkdown.en,
    dates: event.dates.map((date) => ({
      start: date.startDateTime,
      end: date.endDateTime
    })),
    registrationStart: event.registrationOpenTime ? event.registrationOpenTime : null,
    registrationEnd: event.registrationCloseTime ? event.registrationCloseTime : null,
    registrationMax: event.hasMaxRegistration ? event.maxRegistrations || 0 : null,
    waitingListMax: 0,
    isPublished: event.isPublished,
    requiredMembershipStatus: event.requiredMembershipStatus,
    activityType: event.category,
    questions: event.registrationQuestions.map((question) => ({
      questionNl: question.question.nl,
      questionEn: question.question.en,
      required: question.required
    })),
    metadata: [
      {
        type: event.type,
        location: event.location,
        gearEn: event.gear.en,
        gearNl: event.gear.nl,
        experience: event.experience
      }
    ]
  };
}

export function apiToEvent(apiData: EventTypeApi): EventType {
  return {
    id: apiData.id,
    isPublished: apiData.isPublished,
    image: apiData.image || undefined,
    title: {
      nl: apiData.nameNl,
      en: apiData.nameEn
    },
    category: apiData.activityType as CategoryType,
    type: (apiData.metadata[0]?.type as OptionType[]) || [],
    location: apiData.metadata[0]?.location || '',
    descriptionMarkdown: {
      nl: apiData.descriptionNl,
      en: apiData.descriptionEn
    },
    gear: { en: apiData.metadata[0]?.gearEn || '', nl: apiData.metadata[0]?.gearNl || '' },
    experience: (apiData.metadata[0]?.experience as OptionType[]) || [],
    allowsRegistrations: apiData.registrationStart !== null,
    numberOfRegistrations: apiData.registrationCount,
    hasMaxRegistration: apiData.registrationMax !== null,
    maxRegistrations: apiData.registrationMax || undefined,
    dates: apiData.dates.map((date) => ({
      startDateTime: date.start,
      endDateTime: date.end
    })),
    requiredMembershipStatus: apiData.requiredMembershipStatus as MembershipStatus[],
    registrationOpenTime: apiData.registrationStart || undefined,
    registrationCloseTime: apiData.registrationEnd || undefined,
    registrationQuestions: apiData.questions.map((question) => ({
      question: {
        nl: question.questionNl,
        en: question.questionEn
      },
      required: question.required
    }))
  };
}
