import { Checkbox, IconButton, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { EventContent, Language, Question } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditRegistrationQuestionProps {
  questions: Question[];
  handleEventChange: (changes: Partial<EventContent>) => void;
}

export default function EditRegistrationQuestions({
  questions,
  handleEventChange
}: EditRegistrationQuestionProps) {
  const { text } = useLanguage();

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

  const handleAddRegistrationQuestion = () =>
    handleEventChange({
      questions: [
        ...questions,
        {
          id: crypto.randomUUID(),
          questionType: 'shortText',
          question: { en: '', nl: '' },
          required: false
        }
      ]
    });

  const handleRemoveRegistrationQuestion = (id: string) =>
    handleEventChange({
      questions: questions.filter((q) => q.id !== id)
    });

  return (
    <>
      <h3>{text('Registration Questions', 'Inschrijfvragen')}</h3>
      {questions.length === 0 ? (
        <p>{text('No questions yet.', 'Nog geen vragen.')}</p>
      ) : (
        <div className="grid gap-2">
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-center z-0">
              <div className="flex w-full gap-2">
                <TextField
                  multiline
                  value={question.question.en}
                  label={`${text('Question', 'Vraag')} ${index + 1} ${text('English', 'Engels')}`}
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
                  onChange={(e) =>
                    handleRegistrationQuestionChange(question.id, 'question', {
                      en: question.question.en,
                      nl: e.target.value
                    })
                  }
                  fullWidth
                />
              </div>
              <div className="flex">
                <Tooltip title={text('Required', 'Verplicht')}>
                  <Checkbox
                    checked={question.required}
                    onChange={() =>
                      handleRegistrationQuestionChange(
                        question.id,
                        'required',
                        !question.required
                      )
                    }
                  />
                </Tooltip>
                <Tooltip
                  title={text('Delete Question', 'Verwijder Vraag')}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleRemoveRegistrationQuestion(question.id)
                    }
                  >
                    <DeleteIcon fontSize="medium" />
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
            onClick={() => handleAddRegistrationQuestion()}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
}
