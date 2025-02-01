import { ChangeEvent, SyntheticEvent, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Tab, TextField } from '@mui/material';
import TextCard from '../TextCard.tsx';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MarkdownEditorToolbar from './MarkdownEditorToolbar.tsx';
import { text } from '../../util.ts';
import remarkGfm from 'remark-gfm';
import { EventType, LanguageType } from '../../types.ts';

interface MarkdownEditorProps {
  initialMarkdown?: LanguageType;
  // eslint-disable-next-line no-unused-vars
  handleFieldChange: (name: keyof EventType, value: LanguageType) => void;
}

export default function MarkdownEditor({
  initialMarkdown = { en: '', nl: '' },
  handleFieldChange
}: MarkdownEditorProps) {
  const [value, setValue] = useState('1');
  const [markdownContent, setMarkdownContent] = useState<LanguageType>(initialMarkdown);

  const textareaRef = useRef<{ en: HTMLTextAreaElement | null; nl: HTMLTextAreaElement | null }>({
    en: null,
    nl: null
  });

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    langCode: 'en' | 'nl'
  ) => {
    const updatedMarkdown = {
      ...markdownContent,
      [langCode]: event.target.value
    };
    setMarkdownContent(updatedMarkdown);
    handleFieldChange('descriptionMarkdown', updatedMarkdown);
  };

  const insertMarkdown = (syntax: string, langCode: 'en' | 'nl') => {
    const textarea = textareaRef.current[langCode];
    const currentContent = markdownContent[langCode];

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

    const updatedMarkdown = {
      ...markdownContent,
      [langCode]: newContent
    };
    setMarkdownContent(updatedMarkdown);
    handleFieldChange('descriptionMarkdown', updatedMarkdown);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
      textarea.focus();
    }, 0);
  };

  return (
    <>
      <TabContext value={value}>
        <TabList onChange={handleChange}>
          <Tab label={text('Edit', 'Bewerken')} value="1" />
          <Tab label={text('Preview', 'Voorbeeld')} value="2" />
          <Tab label={text('Combined', 'Gecombineerd')} value="3" />
        </TabList>
        <TabPanel value="1">
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'en')} />
          <div className="grid mb-4">
            <TextField
              multiline
              minRows={4}
              value={markdownContent.en}
              onChange={(e) => handleInputChange(e, 'en')}
              inputRef={(el) => (textareaRef.current.en = el)}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert English here', 'Type hier Engels')}
            />
          </div>
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'nl')} />
          <div className="grid">
            <TextField
              multiline
              minRows={4}
              value={markdownContent.nl}
              onChange={(e) => handleInputChange(e, 'nl')}
              inputRef={(el) => (textareaRef.current.nl = el)}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert Dutch here', 'Type hier Nederlands')}
            />
          </div>
        </TabPanel>
        <TabPanel value="2">
          <div className="grid gap-5">
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContent.en}</Markdown>
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContent.nl}</Markdown>
          </div>
        </TabPanel>
        <TabPanel value="3">
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'en')} />
          <div className="grid grid-cols-2 gap-2 mb-4">
            <TextField
              multiline
              minRows={4}
              value={markdownContent.en}
              onChange={(e) => handleInputChange(e, 'en')}
              inputRef={(el) => (textareaRef.current.en = el)}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert English here', 'Type hier Engels')}
            />
            <TextCard className="p-4">
              <Markdown remarkPlugins={[remarkGfm]}>{markdownContent.en}</Markdown>
            </TextCard>
          </div>
          <MarkdownEditorToolbar insertMarkdown={(syntax) => insertMarkdown(syntax, 'nl')} />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              multiline
              minRows={4}
              value={markdownContent.nl}
              onChange={(e) => handleInputChange(e, 'nl')}
              inputRef={(el) => (textareaRef.current.nl = el)}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Insert Dutch here', 'Type hier Nederlands')}
            />
            <TextCard className="p-4">
              <Markdown remarkPlugins={[remarkGfm]}>{markdownContent.nl}</Markdown>
            </TextCard>
          </div>
        </TabPanel>
      </TabContext>
    </>
  );
}
