import { ChangeEvent, SyntheticEvent, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Tab, TextField } from '@mui/material';
import TextCard from './TextCard.tsx';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MarkdownEditorToolbar from './MarkdownEditorToolbar.tsx';
import { text } from '../util.ts';
import remarkGfm from 'remark-gfm';
import { AgendaEventType } from '../types.ts';
import { Moment } from 'moment/moment';

interface MarkdownEditorProps {
  initialMarkdownEN: string;
  initialMarkdownNL: string;
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof AgendaEventType, value: string | Moment | boolean) => void;
}

export default function MarkdownEditor({
  initialMarkdownEN,
  initialMarkdownNL,
  handleFieldChange
}: MarkdownEditorProps) {
  const [value, setValue] = useState('1');
  const [markdownContentEN, setMarkdownContentEN] = useState<string>(initialMarkdownEN);
  const [markdownContentNL, setMarkdownContentNL] = useState<string>(initialMarkdownNL);

  const textareaRefEN = useRef<HTMLTextAreaElement>(null);
  const textareaRefNL = useRef<HTMLTextAreaElement>(null);

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    langCode: 'EN' | 'NL'
  ) => {
    const markdownContent = event.target.value;
    if (langCode === 'EN') {
      handleFieldChange('descriptionMarkdownEN', markdownContent);
      setMarkdownContentEN(markdownContent);
    } else if (langCode === 'NL') {
      handleFieldChange('descriptionMarkdownNL', markdownContent);
      setMarkdownContentNL(markdownContent);
    }
  };

  const insertMarkdown = (syntax: string, langCode: 'EN' | 'NL') => {
    const textarea = langCode === 'EN' ? textareaRefEN.current : textareaRefNL.current;
    const currentContent = langCode === 'EN' ? markdownContentEN : markdownContentNL;

    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const selectedText = currentContent.slice(selectionStart, selectionEnd);

    const isInlineSyntax = ['**', '~~', '`', '_'].includes(syntax);
    const isBlockSyntax = ['### ', '> ', '- ', '1. ', '- [ ] '].includes(syntax);
    const isSpecialSyntax = ['[](url)', '![](url)'].includes(syntax);

    let newContent = currentContent;
    let newCursorPosition = selectionEnd;

    if (isInlineSyntax) {
      newContent =
        currentContent.slice(0, selectionStart) +
        syntax +
        selectedText +
        syntax +
        currentContent.slice(selectionEnd);

      newCursorPosition = selectedText
        ? selectionStart + syntax.length + selectedText.length + syntax.length
        : selectionStart + syntax.length;
    } else if (isBlockSyntax) {
      newContent =
        currentContent.slice(0, selectionStart) +
        syntax +
        selectedText +
        currentContent.slice(selectionEnd);

      newCursorPosition = selectedText
        ? selectionStart + syntax.length + selectedText.length
        : selectionStart + syntax.length + 10;
    } else if (isSpecialSyntax) {
      newContent =
        currentContent.slice(0, selectionStart) +
        (syntax === '[](url)' ? '[](url)' : '![alt text](url)') +
        currentContent.slice(selectionEnd);

      newCursorPosition = selectionStart + (syntax === '[](url)' ? 1 : 15);
    }

    if (langCode === 'EN') {
      handleFieldChange('descriptionMarkdownEN', newContent);
      setMarkdownContentEN(newContent);
    } else if (langCode === 'NL') {
      handleFieldChange('descriptionMarkdownNL', newContent);
      setMarkdownContentNL(newContent);
    }

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
      textarea.focus();
    }, 0);
  };

  return (
    <>
      <TabContext value={value}>
        <TabList onChange={handleChange}>
          <Tab label={text('Combined', 'Gecombineerd')} value="1" />
          <Tab label={text('Edit', 'Bewerken')} value="2" />
          <Tab label={text('Preview', 'Voorbeeld')} value="3" />
        </TabList>
        <TabPanel value="1">
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'EN')} />
          <div className="grid grid-cols-2 space-x-5 mb-4">
            <TextField
              multiline
              minRows={4}
              value={markdownContentEN}
              onChange={(e) => handleInputChange(e, 'EN')}
              inputRef={textareaRefEN}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert English here.', 'Type hier Engels.')}
            />
            <TextCard className="p-4">
              <Markdown remarkPlugins={[remarkGfm]}>{markdownContentEN}</Markdown>
            </TextCard>
          </div>
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'NL')} />
          <div className="grid grid-cols-2 space-x-5">
            <TextField
              multiline
              minRows={4}
              value={markdownContentNL}
              onChange={(e) => handleInputChange(e, 'NL')}
              inputRef={textareaRefNL}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert Dutch here.', 'Type hier Nederlands.')}
            />
            <TextCard className="p-4">
              <Markdown remarkPlugins={[remarkGfm]}>{markdownContentNL}</Markdown>
            </TextCard>
          </div>
        </TabPanel>
        <TabPanel value="2">
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'EN')} />
          <div className="grid mb-4">
            <TextField
              multiline
              minRows={4}
              value={markdownContentEN}
              onChange={(e) => handleInputChange(e, 'EN')}
              inputRef={textareaRefEN}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert English here.', 'Type hier Engels.')}
            />
          </div>
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'NL')} />
          <div className="grid">
            <TextField
              multiline
              minRows={4}
              value={markdownContentNL}
              onChange={(e) => handleInputChange(e, 'NL')}
              inputRef={textareaRefNL}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert Dutch here.', 'Type hier Nederlands.')}
            />
          </div>
        </TabPanel>
        <TabPanel value="3">
          <div className="grid space-y-5">
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContentEN}</Markdown>
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContentNL}</Markdown>
          </div>
        </TabPanel>
      </TabContext>
    </>
  );
}
