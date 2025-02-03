import { text } from '../../util.ts';
import { Checkbox, Fab, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { LanguageType, QuestionType } from '../../types.ts';

interface EditRegistrationQuestionProps {
  registrationQuestions: QuestionType[];
  handleRegistrationQuestionChange: (
    // eslint-disable-next-line no-unused-vars
    index: number,
    // eslint-disable-next-line no-unused-vars
    name: keyof QuestionType,
    // eslint-disable-next-line no-unused-vars
    value: LanguageType | boolean
  ) => void;
  handleAddRegistrationQuestion: () => void;
  // eslint-disable-next-line no-unused-vars
  handleRemoveRegistrationQuestion: (index: number) => void;
}

export default function EditRegistrationQuestions({
  registrationQuestions,
  handleRegistrationQuestionChange,
  handleAddRegistrationQuestion,
  handleRemoveRegistrationQuestion
}: EditRegistrationQuestionProps) {
  return (
    <>
      <h3>{text('Registration Questions', 'Inschrijfvragen')}</h3>
      {registrationQuestions.length === 0 ? (
        <p>{text('No questions yet.', 'Nog geen vragen.')}</p>
      ) : (
        <div className="grid gap-2">
          {registrationQuestions.map((question, index) => (
            <div key={index} className="flex items-center z-0">
              <div className="flex w-full gap-2">
                <TextField
                  multiline
                  value={question.question.en}
                  label={`${text('Question', 'Vraag')} ${index + 1} ${text('English', 'Engels')}`}
                  onChange={(e) =>
                    handleRegistrationQuestionChange(index, 'question', {
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
                    handleRegistrationQuestionChange(index, 'question', {
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
                      handleRegistrationQuestionChange(index, 'required', !question.required)
                    }
                  />
                </Tooltip>
                <Tooltip title={text('Delete Question', 'Verwijder Vraag')}>
                  <Fab
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRegistrationQuestion(index)}
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
        <Tooltip title={text('Add Question', 'Voeg Vraag Toe')}>
          <Fab size="small" color="primary" onClick={() => handleAddRegistrationQuestion()}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>
    </>
  );
}
