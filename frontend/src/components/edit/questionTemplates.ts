import {Question} from '../../types.ts';

export const spQuestions: Omit<Question, 'id'>[] = [
  {
    question: {
      en: 'Did you attend an introduction weekend?',
      nl: 'Ben je op een introductieweekend geweest?'
    },
    questionType: {type: 'boolean'},
    required: true
  },
  {
    question: {
      en: 'Climbing Experience',
      nl: 'Klimervaring'
    },
    questionType: {type: 'text'},
    required: true
  },
  {
    question: {
      en: 'Additional Remarks',
      nl: 'Aanvullende opmerkingen'
    },
    questionType: {type: 'text'},
    required: false
  }
];

export const mpQuestions: Omit<Question, 'id'>[] = [
  {
    question: {
      en: 'Climbing Experience',
      nl: 'Klimervaring'
    },
    questionType: {type: 'text'},
    required: true
  },
  {
    question: {
      en: 'Lead climbing level (rock)',
      nl: 'Voorklimniveau (rots)'
    },
    questionType: {type: 'text'},
    required: true
  },
  {
    question: {
      en: 'Lead climbing level (indoor)',
      nl: 'Voorklimniveau (indoor)'
    },
    questionType: {type: 'text'},
    required: true
  },
  {
    question: {
      en: 'Additional Remarks',
      nl: 'Aanvullende opmerkingen'
    },
    questionType: {type: 'text'},
    required: false
  }
];

export const weekendQuestions: Omit<Question, 'id'>[] = [
  {
    question: {
      en: 'Which task would you like to do?',
      nl: 'Wat voor taak zou je willen hebben?'
    },
    questionType: {
      type: 'multipleChoice',
      options: [
        {en: 'Weekend organiser', nl: 'Weekend organisator'},
        {en: 'Doing groceries', nl: 'Boodschappen doen'},
        {en: 'Arranging gear', nl: 'Materiaal regelen'},
        {en: 'Booking camping place', nl: 'Camping boeken'}
      ]
    },
    required: true
  },
  {
    question: {
      en: 'Do you have dietary wishes?',
      nl: 'Heb je dieetwensen?'
    },
    questionType: {type: 'boolean'},
    required: false
  },
  {
    question: {
      en: 'What would you like to drink during this weekend?',
      nl: 'Wat zou je willen drinken tijdens het weekend?'
    },
    questionType: {type: 'text'},
    required: true
  },
  {
    question: {
      en: 'Do you have a tent? For how many people?',
      nl: 'Heb je een tent? Voor hoeveel mensen?'
    },
    questionType: {type: 'text'},
    required: false
  },
  {
    question: {
      en: 'Do you have a car? For how many people?',
      nl: 'Heb je een auto? Voor hoeveel mensen?'
    },
    questionType: {type: 'text'},
    required: false
  },
  {
    question: {
      en: 'When would you like to leave?',
      nl: 'Wanneer zou je willen vertrekken?'
    },
    questionType: {type: 'date'},
    required: false
  },
  {
    question: {
      en: 'Would you like to do your exam (if possible)?',
      nl: 'Wil je je examen doen (als dat mogelijk is)?'
    },
    questionType: {type: 'boolean'},
    required: true
  },
  {
    question: {
      en: 'Do you want to be kader on duty this weekend?',
      nl: 'Wil je kader in functie zijn dit weekend?'
    },
    questionType: {
      type: 'multipleChoice',
      options: [
        {en: 'Yes', nl: 'Ja'},
        {en: 'Partially', nl: 'Deels'},
        {en: 'No', nl: 'Nee'}
      ]
    },
    required: true
  },
  {
    question: {
      en: 'Additional Remarks',
      nl: 'Aanvullende opmerkingen'
    },
    questionType: {type: 'text'},
    required: false
  }
];