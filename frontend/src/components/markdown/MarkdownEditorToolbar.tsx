import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CodeIcon from '@mui/icons-material/Code';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LinkIcon from '@mui/icons-material/Link';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import TitleIcon from '@mui/icons-material/Title';
import CollectionsIcon from '@mui/icons-material/Collections';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {useState} from 'react';
import Gallery from '../Gallery.tsx';
import {FileMetadata} from '../../types.ts';

interface MarkdownEditorToolbarProps {
  insertMarkdown: (syntax: string) => void;
}

export default function MarkdownEditorToolbar({
  insertMarkdown
}: MarkdownEditorToolbarProps) {
  const {text} = useLanguage();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const toggleGallerOpen = () => {
    setGalleryOpen(prevState => !prevState);
  };
  const handleGallerySelect = (file: FileMetadata) => {
    const isImage = file.mimeType?.startsWith('image/');
    const url = `${window.location.origin}/api/file/${file.id}`;
    setGalleryOpen(false);
    if (isImage) {
      insertMarkdown(`![](${url})`);
    } else {
      insertMarkdown(`[${file.originalFilename}](${url})`);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Tooltip title={text('Add Header', 'Voeg kop toe')}>
        <IconButton onClick={() => insertMarkdown('### ')}>
          <TitleIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Bold Text', 'Vetgedrukte tekst')}>
        <IconButton onClick={() => insertMarkdown('**')}>
          <FormatBoldIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Italic Text', 'Cursieve tekst')}>
        <IconButton onClick={() => insertMarkdown('_')}>
          <FormatItalicIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Strikethrough Text', 'Doorhalingen')}>
        <IconButton onClick={() => insertMarkdown('~~')}>
          <StrikethroughSIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Insert Link', 'Link toevoegen')}>
        <IconButton onClick={() => insertMarkdown('[](url)')}>
          <LinkIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Insert Quote', 'Citaat toevoegen')}>
        <IconButton onClick={() => insertMarkdown('> ')}>
          <FormatQuoteIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Inline Code', 'In-line code')}>
        <IconButton onClick={() => insertMarkdown('`')}>
          <CodeIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Tooltip title={text('Insert Image/document', 'Afbeelding/document toevoegen')}>
        <IconButton onClick={toggleGallerOpen}>
          <CollectionsIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <Gallery
        dialogOpen={galleryOpen}
        toggleDialogOpen={toggleGallerOpen}
        onSelect={handleGallerySelect}
      />
    </div>
  );
}
