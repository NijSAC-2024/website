import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Tab, TextField } from '@mui/material';
import TextCard from './TextCard.tsx';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MarkdownEditorToolbar from './MarkdownEditorToolbar.tsx';
import { text } from '../util.ts';

interface MarkdownEditorProps {
  initialContent?: string;
}

export default function MarkdownEditor({ initialContent = '' }: MarkdownEditorProps) {
  const [value, setValue] = React.useState('1');
  const [markdownContent, setMarkdownContent] = useState<string>(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownContent(event.target.value);
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const currentValue = markdownContent;

    const selectedText = currentValue.slice(selectionStart, selectionEnd);

    const isInlineSyntax = ['**', '~~', '`', '_'].includes(syntax);
    const isBlockSyntax = ['### ', '> ', '- ', '1. ', '- [ ] '].includes(syntax);
    const isSpecialSyntax = ['[](url)', '![](url)'].includes(syntax);

    let newContent = currentValue;
    let newCursorPosition = selectionEnd;

    if (isInlineSyntax) {
      newContent =
        currentValue.slice(0, selectionStart) +
        syntax +
        selectedText +
        syntax +
        currentValue.slice(selectionEnd);

      newCursorPosition = selectedText
        ? selectionStart + syntax.length + selectedText.length + syntax.length
        : selectionStart + syntax.length;
    } else if (isBlockSyntax) {
      newContent =
        currentValue.slice(0, selectionStart) +
        syntax +
        selectedText +
        currentValue.slice(selectionEnd);

      newCursorPosition = selectedText
        ? selectionStart + syntax.length + selectedText.length
        : selectionStart + syntax.length + 10; // Default length for "Blockquote"/"Item"
    } else if (isSpecialSyntax) {
      newContent =
        currentValue.slice(0, selectionStart) +
        (syntax === '[](url)' ? '[](url)' : '![alt text](url)') +
        currentValue.slice(selectionEnd);

      newCursorPosition = selectionStart + (syntax === '[](url)' ? 6 : 15); // Position cursor in "text" or "alt text"
    }

    setMarkdownContent(newContent);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
      textarea.focus();
    }, 0);
  };

  return (
    <>
      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label="lab API tabs example">
          <Tab label={text('Combined', 'Gecombineerd')} value="1" />
          <Tab label={text('Edit', 'Bewerken')} value="2" />
          <Tab label={text('Preview', 'Voorbeeld')} value="3" />
        </TabList>
        <TabPanel value="1">
          <MarkdownEditorToolbar insertMarkdown={insertMarkdown} />
          <div className="grid grid-cols-2 space-x-5">
            <TextField
              multiline
              minRows={4}
              value={markdownContent}
              onChange={handleInputChange}
              inputRef={textareaRef}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder={text('Enter markdown content here...', 'Type hier markdown...')}
            />
            <TextCard className="p-4">
              <Markdown>{markdownContent}</Markdown>
            </TextCard>
          </div>
        </TabPanel>
        <TabPanel value="2">
          <MarkdownEditorToolbar insertMarkdown={insertMarkdown} />
          <div className="grid">
            <TextField
              multiline
              minRows={4}
              value={markdownContent}
              onChange={handleInputChange}
              inputRef={textareaRef}
              className="flex-1 p-2 border rounded resize-none font-mono"
              placeholder="Enter markdown content here..."
            />
          </div>
        </TabPanel>
        <TabPanel value="3">
          <div className="grid">
            <Markdown>{markdownContent}</Markdown>
          </div>
        </TabPanel>
      </TabContext>
    </>
  );
}
