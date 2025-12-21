import {Checkbox, IconButton, TextField, Menu, MenuItem} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ListIcon from '@mui/icons-material/List';
import NumbersIcon from '@mui/icons-material/Numbers';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DateRangeIcon from '@mui/icons-material/DateRange';
import {EventContent, Language, Question, QuestionTypeType} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useState} from 'react';
import {getLabel} from '../../util.ts';


interface EditRegistrationQuestionProps {
  questions: Question[];
  handleEventChange: (changes: Partial<EventContent>) => void;
}

export default function EditRegistrationQuestions({
  questions,
  handleEventChange
}: EditRegistrationQuestionProps) {
  const {text} = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const questionTypeMenuItems = [
    {type: 'text', icon: <TextFieldsIcon fontSize="small"/>, label: {en: 'Text Question', nl: 'Tekstvraag'}},
    {
      type: 'multipleChoice',
      icon: <ListIcon fontSize="small"/>,
      label: {en: 'Option Question', nl: 'Meerkeuzevraag'}
    },
    {type: 'number', icon: <NumbersIcon fontSize="small"/>, label: {en: 'Number Question', nl: 'Getalvraag'}},
    {
      type: 'boolean',
      icon: <CheckBoxIcon fontSize="small"/>,
      label: {en: 'Checkbox Question', nl: 'Checkboxvraag'}
    },
    {
      type: 'date',
      icon: <DateRangeIcon fontSize="small"/>,
      label: {en: 'Date & Time Question', nl: 'Datum- & Tijdvraag'}
    }
  ];

  const activeQuestion = activeQuestionId
    ? questions.find((q) => q.id === activeQuestionId)
    : null;

  const handleRegistrationQuestionChange = (
    id: string,
    name: keyof Question,
    value: Language | boolean
  ) => {
    handleEventChange({
      questions: questions.map((question) =>
        question.id === id ? {...question, [name]: value} : question
      )
    });
  };

  const handleRemoveRegistrationQuestion = (id: string) =>
    handleEventChange({
      questions: questions.filter((q) => q.id !== id)
    });

  const handleSelectQuestionType = (type: QuestionTypeType) => {
    if (activeQuestionId) {
      handleEventChange({
        questions: questions.map((q) =>
          q.id === activeQuestionId
            ? {
              ...q,
              questionType: {
                type,
                options: type === 'multipleChoice' ? q.questionType.options ?? [] : undefined
              }
            }
            : q
        )
      });
    } else {
      handleEventChange({
        questions: [
          ...questions,
          {
            id: crypto.randomUUID(),
            questionType: {
              type,
              options: type === 'multipleChoice' ? [] : undefined
            },
            question: {en: '', nl: ''},
            required: false
          }
        ]
      });
    }
    setAnchorEl(null);
    setActiveQuestionId(null);
  };

  const handleOptionChange = (
    questionId: string,
    index: number,
    lang: keyof Language,
    value: string
  ) => {
    handleEventChange({
      questions: questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            questionType: {
              ...q.questionType,
              options: q.questionType.options?.map((opt, i) =>
                i === index ? {...opt, [lang]: value} : opt
              ) ?? []
            }
          }
          : q
      )
    });
  };

  const handleAddOption = (questionId: string) => {
    handleEventChange({
      questions: questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            questionType: {
              ...q.questionType,
              options: [...(q.questionType.options ?? []), {en: '', nl: ''}]
            }
          }
          : q
      )
    });
  };

  const handleRemoveOption = (questionId: string, index: number) => {
    handleEventChange({
      questions: questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            questionType: {
              ...q.questionType,
              options: q.questionType.options?.filter((_, i) => i !== index) ?? []
            }
          }
          : q
      )
    });
  };


  return (
    <>
      <h3>{text('Registration Questions', 'Inschrijfvragen')}</h3>
      {questions.length === 0 ? (
        <p>{text('No questions yet.', 'Nog geen vragen.')}</p>
      ) : (
        <div className="grid gap-4 xl:gap-3">
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-start z-0">
              <div className="grid xl:grid-cols-2 w-full gap-2">
                <TextField
                  multiline
                  value={question.question.en}
                  label={`${text(getLabel(question.questionType.type))} ${index + 1} ${text('English', 'Engels')}`}
                  onChange={(e) =>
                    handleRegistrationQuestionChange(question.id, 'question', {
                      en: e.target.value,
                      nl: question.question.nl
                    })
                  }
                  fullWidth
                />
                <TextField
                  multiline
                  value={question.question.nl}
                  label={`${text(getLabel(question.questionType.type))} ${index + 1} ${text('Dutch', 'Nederlands')}`}
                  onChange={(e) =>
                    handleRegistrationQuestionChange(question.id, 'question', {
                      en: question.question.en,
                      nl: e.target.value
                    })
                  }
                  fullWidth
                />
                {question.questionType.type === 'multipleChoice' && (
                  <div className="mt-2 space-y-3 xl:col-span-2">
                    {(question.questionType.options ?? []).map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <TextField
                          size="small"
                          label={`${text('Option', 'Optie')} ${i + 1} ${text('English', 'Engels')}`}
                          value={option.en}
                          onChange={(e) =>
                            handleOptionChange(question.id, i, 'en', e.target.value)
                          }
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label={`${text('Option', 'Optie')} ${i + 1} ${text('Dutch', 'Nederlands')}`}
                          value={option.nl}
                          onChange={(e) =>
                            handleOptionChange(question.id, i, 'nl', e.target.value)
                          }
                          fullWidth
                        />
                        <Tooltip title={text('Delete Option', 'Verwijder Optie')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveOption(question.id, i)}
                          >
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Tooltip title={text('Add Option', 'Voeg Optie Toe')}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAddOption(question.id)}
                        >
                          <AddIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-2.5">
                <Tooltip title={text('Options', 'Opties')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setActiveQuestionId(question.id);
                    }}
                  >
                    <MoreVertIcon/>
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center z-0">
        <Tooltip title={text('Add Question', 'Voeg Vraag Toe')}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <AddIcon fontSize="large"/>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => {
            setAnchorEl(null);
            setActiveQuestionId(null);
          }}
        >
          {activeQuestion ? (
            <>
              <MenuItem disabled>{text('Change Type', 'Wijzig Type')}</MenuItem>
              {questionTypeMenuItems.map((item) => (
                <MenuItem
                  key={item.type}
                  selected={activeQuestion.questionType.type === item.type}
                  onClick={() => handleSelectQuestionType(item.type as QuestionTypeType)}
                >
                  {item.icon}
                  <span className="ml-1">{text(item.label)}</span>
                </MenuItem>
              ))}
              <MenuItem
                onClick={() => {
                  handleRegistrationQuestionChange(
                    activeQuestion.id,
                    'required',
                    !activeQuestion.required
                  );
                  setAnchorEl(null);
                  setActiveQuestionId(null);
                }}
              >
                <div className="ml-[-0.6rem] flex items-center">
                  <Checkbox
                    checked={activeQuestion.required}
                    size="small"
                  />
                  <span className="ml-[-0.2rem]">{text('Required', 'Verplicht')}</span>
                </div>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleRemoveRegistrationQuestion(activeQuestion.id);
                  setAnchorEl(null);
                  setActiveQuestionId(null);
                }}
              >
                <DeleteIcon color="error" fontSize="small" className="mr-2"/>
                <p className="dark:text-[#f44336] text-[#d32f2f]">{text('Delete Question', 'Verwijder Vraag')}</p>
              </MenuItem>
            </>
          ) : (
            questionTypeMenuItems.map((item) => (
              <MenuItem
                key={item.type}
                onClick={() => handleSelectQuestionType(item.type as QuestionTypeType)}
              >
                {item.icon}
                <span className="ml-1">{text(item.label)}</span>
              </MenuItem>
            ))
          )}
        </Menu>
      </div>
    </>
  );
}
