import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  Checklist as ChecklistIcon,
  Code as CodeIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as BulletsIcon,
  FormatListNumbered as EnumerateIcon,
  FormatQuote as QuoteIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  StrikethroughS as StrikethroughIcon,
  Title as TitleIcon
} from '@mui/icons-material';
import { text } from '../../util.ts';
import { useLanguage } from '../../providers/LanguageProvider.tsx';

interface MarkdownEditorToolbarProps {
  insertMarkdown: (syntax: string) => void;
}

export default function MarkdownEditorToolbar({ insertMarkdown }: MarkdownEditorToolbarProps) {
  const { language: lang } = useLanguage();
  return (
    <div className="flex items-center space-x-2">
      <Tooltip title={text(lang, 'Add Header', 'Voeg kop toe')}>
        <IconButton onClick={() => insertMarkdown('### ')}>
          <TitleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Bold Text', 'Vetgedrukte tekst')}>
        <IconButton onClick={() => insertMarkdown('**')}>
          <BoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Italic Text', 'Cursieve tekst')}>
        <IconButton onClick={() => insertMarkdown('_')}>
          <ItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Strikethrough Text', 'Doorhalingen')}>
        <IconButton onClick={() => insertMarkdown('~~')}>
          <StrikethroughIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Insert Link', 'Link toevoegen')}>
        <IconButton onClick={() => insertMarkdown('[](url)')}>
          <LinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Insert Quote', 'Citaat toevoegen')}>
        <IconButton onClick={() => insertMarkdown('> ')}>
          <QuoteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Inline Code', 'In-line code')}>
        <IconButton onClick={() => insertMarkdown('`')}>
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Insert Image', 'Afbeelding toevoegen')}>
        <IconButton onClick={() => insertMarkdown('![](url)')}>
          <ImageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Unordered List', 'Ongeordende lijst')}>
        <IconButton onClick={() => insertMarkdown('- ')}>
          <BulletsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Ordered List', 'Geordende lijst')}>
        <IconButton onClick={() => insertMarkdown('1. ')}>
          <EnumerateIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={text(lang, 'Checklist', 'Checklist')}>
        <IconButton onClick={() => insertMarkdown('- [ ] ')}>
          <ChecklistIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
