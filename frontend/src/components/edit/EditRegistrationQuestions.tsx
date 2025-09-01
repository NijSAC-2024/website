import { Checkbox, IconButton, TextField, Menu, MenuItem } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ListIcon from '@mui/icons-material/List';
import NumbersIcon from '@mui/icons-material/Numbers';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { EventContent, Language, Question, QuestionType } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useState } from 'react';

interface EditRegistrationQuestionProps {
  questions: Question[];
  handleEventChange: (changes: Partial<EventContent>) => void;
}

export default function EditRegistrationQuestions({
  questions,
  handleEventChange
}: EditRegistrationQuestionProps) {
  const { text } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const questionTypeMenuItems =  [
    { type: 'shortText', icon: <TextFieldsIcon fontSize="small" />, label: text('Text Question', 'Tekstvraag') },
    { type: 'multipleChoice', icon: <ListIcon fontSize="small" />, label: text('Option Question', 'Meerkeuzevraag') },
    { type: 'number', icon: <NumbersIcon fontSize="small" />, label: text('Number Question', 'Getalvraag') },
    { type: 'boolean', icon: <CheckBoxIcon fontSize="small" />, label: text('Checkbox Question', 'Checkboxvraag') }
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
        question.id === id ? { ...question, [name]: value } : question
      )
    });
  };

  const handleRemoveRegistrationQuestion = (id: string) =>
    handleEventChange({
      questions: questions.filter((q) => q.id !== id)
    });

  const handleSelectQuestionType = (type: QuestionType) => {
    if (activeQuestionId) {
      handleEventChange({
        questions: questions.map((q) =>
          q.id === activeQuestionId ? { ...q, questionType: type } : q
        )
      });
    } else {
      handleEventChange({
        questions: [
          ...questions,
          {
            id: crypto.randomUUID(),
            questionType: type,
            question: { en: '', nl: '' },
            required: false
          }
        ]
      });
    }
    setAnchorEl(null);
    setActiveQuestionId(null);
  };

  return (
    <>
      <h3>{text('Registration Questions', 'Inschrijfvragen')}</h3>
      {questions.length === 0 ? (
        <p>{text('No questions yet.', 'Nog geen vragen.')}</p>
      ) : (
        <div className="grid gap-4 xl:gap-3">
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-center z-0">
              <div className="grid xl:grid-cols-2 w-full gap-2">
                <TextField
                  multiline
                  value={question.question.en}
                  label={`${text('Question', 'Vraag')} ${index + 1} ${text('English', 'Engels')}`}
                  placeholder={question.questionType === 'multipleChoice' ? text('Options separated by commas', 'Opties gescheiden door komma\'s') : ''}
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
                  label={`${text('Question', 'Vraag')} ${index + 1} ${text('Dutch', 'Nederlands')}`}
                  placeholder={question.questionType === 'multipleChoice' ? text('Options separated by commas', 'Opties gescheiden door komma\'s') : ''}
                  onChange={(e) =>
                    handleRegistrationQuestionChange(question.id, 'question', {
                      en: question.question.en,
                      nl: e.target.value
                    })
                  }
                  fullWidth
                />

              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setActiveQuestionId(question.id);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
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
            <AddIcon fontSize="large" />
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
                  selected={activeQuestion.questionType === item.type}
                  onClick={() => handleSelectQuestionType(item.type as QuestionType)}
                >
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
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
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" className="mr-2" />
                {text('Delete Question', 'Verwijder Vraag')}
              </MenuItem>
            </>
          ) : (
            questionTypeMenuItems.map((item) => (
              <MenuItem
                key={item.type}
                onClick={() => handleSelectQuestionType(item.type as QuestionType)}
              >
                {item.label}
              </MenuItem>
            ))
          )}
        </Menu>
      </div>
    </>
  );
}
