import { text } from '../../util.ts';
import { Checkbox, Fab, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Language, Question } from '../../types.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface EditRegistrationQuestionProps {
  registrationQuestions: Question[];
  handleRegistrationQuestionChange: (
    id: string,
    name: keyof Question,
    value: Language | boolean
  ) => void;
  handleAddRegistrationQuestion: () => void;
  handleRemoveRegistrationQuestion: (id: string) => void;
}

export default function EditRegistrationQuestions({
  registrationQuestions,
  handleRegistrationQuestionChange,
  handleAddRegistrationQuestion,
  handleRemoveRegistrationQuestion
}: EditRegistrationQuestionProps) {
  const { language: lang } = useLanguage();

  return (
    <>
      <h3>{text(lang, 'Registration Questions', 'Inschrijfvragen')}</h3>
      {registrationQuestions.length === 0 ? (
        <p>{text(lang, 'No questions yet.', 'Nog geen vragen.')}</p>
      ) : (
        <div className="grid gap-2">
          {registrationQuestions.map((question, index) => (
            <div key={question.id} className="flex items-center z-0">
              <div className="flex w-full gap-2">
                <TextField
                  multiline
                  value={question.question.en}
                  label={`${text(lang, 'Question', 'Vraag')} ${index + 1} ${text(lang, 'English', 'Engels')}`}
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
                  label={`${text(lang, 'Question', 'Vraag')} ${index + 1} ${text(lang, 'Dutch', 'Nederlands')}`}
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
                <Tooltip title={text(lang, 'Required', 'Verplicht')}>
                  <Checkbox
                    checked={question.required}
                    onChange={() =>
                      handleRegistrationQuestionChange(question.id, 'required', !question.required)
                    }
                  />
                </Tooltip>
                <Tooltip title={text(lang, 'Delete Question', 'Verwijder Vraag')}>
                  <Fab
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRegistrationQuestion(question.id)}
                  >
                    <DeleteIcon />
                  </Fab>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <Tooltip title={text(lang, 'Add Question', 'Voeg Vraag Toe')}>
          <Fab size="small" color="primary" onClick={() => handleAddRegistrationQuestion()}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>
    </>
  );
}
