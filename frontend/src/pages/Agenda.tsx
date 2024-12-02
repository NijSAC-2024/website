import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import CalenderCard from '../components/CalenderCard.tsx';

import text from '../util.ts';

import { useLanguage } from '../providers/LanguageProvider.tsx';

import { useState } from 'react';

import { CalendarCategoryType, CalendarEventType } from '../types.ts';

export default function Agenda() {
  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);

  const aYearFromNow = new Date(currentDay.getTime()); // Copy date object
  aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fromDateTime, setFromDateTime] = useState(currentDay);
  const [toDateTime, setToDateTime] = useState(aYearFromNow);

  const exampleAPIResponse = {
    categories: [
      { id: 'climbing-weekend', 'en-US': 'Climbing Weekend', 'nl-NL': 'Klimweekend' },
      { id: 'training', 'en-US': 'Training', 'nl-NL': 'Training' },
      { id: 'exam', 'en-US': 'Exam', 'nl-NL': 'Examen' },
      { id: 'outdoor', 'en-US': 'Outdoor Climbing', 'nl-NL': 'Buitenklimmen' },
      { id: 'other', 'en-US': 'Other', 'nl-NL': 'Overig' }
    ],
    events: [
      {
        id: 1,
        image: '/images/test-header-image.jpg',
        title: { 'en-US': 'Albufeira', 'nl-NL': 'Albufeira' },
        categoryId: 'climbing-weekend',
        categoryName: { 'en-US': 'Climbing Weekend', 'nl-NL': 'Klimweekend' },
        descriptionMarkdown: {
          'en-US': 'You must register to participate!',
          'nl-NL': 'Je moet je registreren om mee te doen!'
        },
        registrations: 12,
        startDateTime: '2025-03-06T00:00:00.000Z',
        endDateTime: '2025-03-08T00:00:00.000Z',
        registerState: 'register',
        registrationOpenTime: '2023-03-05T00:00:00.000Z',
        registrationCloseTime: '2027-03-07T00:00:00.000Z'
      },
      {
        id: 2,
        image: '/images/test-header-image.jpg',
        title: { 'en-US': 'Important exam', 'nl-NL': 'Belangrijk Examen' },
        categoryId: 'exam',
        categoryName: { 'en-US': 'Exam', 'nl-NL': 'Examen' },
        descriptionMarkdown: {
          'en-US': 'This event is full!',
          'nl-NL': 'Deze activiteit zit vol!'
        },
        registrations: 20,
        startDateTime: '2025-11-06T00:00:00.000Z',
        endDateTime: '2025-11-07T00:00:00.000Z',
        registerState: 'full',
        registrationOpenTime: '2025-03-05T00:00:00.000Z',
        registrationCloseTime: '2025-03-07T00:00:00.000Z'
      },
      {
        id: 3,
        image: '/images/test-header-image.jpg',
        title: { 'en-US': 'Albufeira', 'nl-NL': 'Albufeira' },
        categoryId: 'exam',
        categoryName: { 'en-US': 'Climbing Weekend', 'nl-NL': 'Klimweekend' },
        descriptionMarkdown: {
          'en-US': 'Dit examen!',
          'nl-NL': 'Je moet je registreren om mee te doen!'
        },
        registrations: 15,
        startDateTime: '2025-11-06T00:00:00.000Z',
        endDateTime: '2025-11-06T01:00:00.000Z',
        registerState: 'login',
        registrationOpenTime: '2025-03-05T00:00:00.000Z',
        registrationCloseTime: '2025-03-07T00:00:00.000Z'
      },
      {
        id: 4,
        image: '/images/test-header-image.jpg',
        title: { 'en-US': 'Albufeira', 'nl-NL': 'Albufeira' },
        categoryId: 'climbing-weekend',
        categoryName: { 'en-US': 'Climbing Weekend', 'nl-NL': 'Klimweekend' },
        descriptionMarkdown: {
          'en-US': 'You must register to participate!',
          'nl-NL': 'Je moet je registreren om mee te doen!'
        },
        registrations: 12,
        startDateTime: '2025-11-06T00:00:00.000Z',
        endDateTime: '2025-11-07T00:00:00.000Z',
        registerState: 'no-register',
        registrationOpenTime: '2025-03-05T00:00:00.000Z',
        registrationCloseTime: '2025-03-07T00:00:00.000Z'
      }
    ]
  };

  const localeCode = useLanguage().getLocaleCode();

  return (
    <GenericPage>
      <div className="Agenda font-family-sans">
        <div className="grid grid-cols-[0.33fr_0.33fr_0.33fr] grid-rows-1 gap-5 mt-5">
          <ContentCard className="col-start-1 col-end-3">
            <h1>{text('Calendar', 'Agenda')}</h1>
            <p>
              {text(
                'To register for activities you must first log in.',
                'Om je aan te melden voor activiteiten moet je eerst ingelogd zijn.'
              )}
            </p>
            <p>
              {text(
                'Questions about activities or climbing weekends? Contact the board or the climbing commissioner.',
                'Vragen over activiteiten of klimweekenden? Neem contact met het bestuur of de klimcommissaris.'
              )}
            </p>
          </ContentCard>
          <ContentCard>
            <h2>{text('Filter', 'Filteren')}</h2>
            <div className="flex flex-col">
              <label className="mt-1">{text('Categories', 'Categorieën')}</label>
              <select
                className="rounded-sm border border-black/10 pt-1.5 pb-1.5 pl-1.25 pr-2.5 dark:bg-[#121212] dark:border-[rgba(255,255,255,0.1)]"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">{text('All', 'Alles')}</option>
                {exampleAPIResponse.categories.map((category: CalendarCategoryType) => (
                  <option value={category.id} key={category.id}>
                    {category[localeCode]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mt-1">{text('From Date', 'Vanaf')}</label>
              <input
                type="date"
                className="rounded-sm border border-black/10 p-1.5 pl-1.25 pr-1.25 dark:bg-[#121212] dark:border-[rgba(255,255,255,0.1)]"
                onChange={(e) => {
                  if (e.target.value && !isNaN(new Date(e.target.value).getTime())) {
                    setFromDateTime(new Date(e.target.value));
                  }
                }}
                value={fromDateTime.toISOString().split('T')[0]}
              ></input>
            </div>
            <div className="flex flex-col">
              <label className="mt-1">{text('To Date', 'Tot')}</label>
              <input
                type="date"
                className="rounded-sm border border-black/10 p-1.5 pl-1.25 pr-1.25 dark:bg-[#121212] dark:border-[rgba(255,255,255,0.1)]"
                onChange={(e) => {
                  if (e.target.value && !isNaN(new Date(e.target.value).getTime())) {
                    setToDateTime(new Date(e.target.value));
                  }
                }}
                value={toDateTime.toISOString().split('T')[0]}
              ></input>
            </div>
          </ContentCard>
        </div>

        <div className="Agenda-content grid grid-cols-[0.33fr_0.33fr_0.33fr] gap-5 mt-5">
          {exampleAPIResponse.events
            .filter(
              (e: CalendarEventType) =>
                selectedCategory === 'all' || e.categoryId === selectedCategory
            )
            .filter(
              (e) =>
                e.startDateTime &&
                new Date(e.endDateTime).getTime() >= fromDateTime.getTime() &&
                new Date(e.startDateTime).getTime() <= toDateTime.getTime()
            )
            .map((event: CalendarEventType) => (
              <CalenderCard {...event} key={event.id} />
            ))}
        </div>

        <div className="Agenda-pagination"></div>
      </div>
    </GenericPage>
  );
}
