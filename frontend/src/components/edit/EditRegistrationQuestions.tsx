import {Checkbox, IconButton, Menu, MenuItem, TextField} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ListIcon from '@mui/icons-material/List';
import NumbersIcon from '@mui/icons-material/Numbers';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DateRangeIcon from '@mui/icons-material/DateRange';
import {memo, useState} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {EventContent, QuestionTypeType} from '../../types.ts';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {getLabel} from '../../util.ts';

function QuestionOptions({questionIndex}: {questionIndex: number}) {
  const {text} = useLanguage();
  const {control, register} = useFormContext<EventContent>();
  const {fields, append, remove} = useFieldArray({
    control,
    name: `questions.${questionIndex}.questionType.options` as const
  });

  return (
    <div className="mt-2 space-y-3 xl:col-span-2">
      {fields.map((option, i) => (
        <div key={option.id} className="flex items-center gap-2">
          <TextField
            size="small"
            label={`${text('Option', 'Optie')} ${i + 1} ${text('English', 'Engels')}`}
            {...register(`questions.${questionIndex}.questionType.options.${i}.en` as const)}
            fullWidth
          />
          <TextField
            size="small"
            label={`${text('Option', 'Optie')} ${i + 1} ${text('Dutch', 'Nederlands')}`}
            {...register(`questions.${questionIndex}.questionType.options.${i}.nl` as const)}
            fullWidth
          />
          <Tooltip title={text('Delete Option', 'Verwijder Optie')}>
            <IconButton
              size="small"
              color="error"
              onClick={() => remove(i)}
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
            onClick={() => append({en: '', nl: ''})}
          >
            <AddIcon fontSize="small"/>
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

function EditRegistrationQuestions() {
  const {text} = useLanguage();
  const {control, register, setValue} = useFormContext<EventContent>();
  const {fields, append, remove, update} = useFieldArray({
    control,
    name: 'questions'
  });
  const questions = useWatch({
    control,
    name: 'questions'
  }) ?? [];
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

  const activeIndex = questions.findIndex((q) => q.id === activeQuestionId);
  const activeQuestion = activeIndex >= 0 ? questions[activeIndex] : null;

  const handleSelectQuestionType = (type: QuestionTypeType) => {
    if (activeIndex >= 0 && activeQuestion) {
      update(activeIndex, {
        ...activeQuestion,
        questionType: {
          type,
          options: type === 'multipleChoice' ? activeQuestion.questionType.options ?? [] : undefined
        }
      });
    } else {
      append({
        id: crypto.randomUUID(),
        questionType: {
          type,
          options: type === 'multipleChoice' ? [] : undefined
        },
        question: {en: '', nl: ''},
        required: false
      });
    }
    setAnchorEl(null);
    setActiveQuestionId(null);
  };

  return (
    <>
      <h3>{text('Registration Questions', 'Inschrijfvragen')}</h3>
      {fields.length === 0 ? (
        <p>{text('No questions yet.', 'Nog geen vragen.')}</p>
      ) : (
        <div className="grid gap-4 xl:gap-3">
          {fields.map((question, index) => (
            <div key={question.id} className="flex items-start z-0">
              <div className="grid xl:grid-cols-2 w-full gap-2">
                <TextField
                  multiline
                  label={`${text(getLabel(question.questionType.type))} ${index + 1} ${text('English', 'Engels')}`}
                  {...register(`questions.${index}.question.en` as const)}
                  fullWidth
                />
                <TextField
                  multiline
                  label={`${text(getLabel(question.questionType.type))} ${index + 1} ${text('Dutch', 'Nederlands')}`}
                  {...register(`questions.${index}.question.nl` as const)}
                  fullWidth
                />
                {questions[index]?.questionType.type === 'multipleChoice' && (
                  <QuestionOptions questionIndex={index}/>
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
                  if (activeIndex >= 0) {
                    setValue(`questions.${activeIndex}.required`, !activeQuestion.required, {shouldDirty: true});
                  }
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
                  if (activeIndex >= 0) {
                    remove(activeIndex);
                  }
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

export default memo(EditRegistrationQuestions);
