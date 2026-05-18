import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {Button, FormControlLabel, IconButton, InputAdornment, Switch, TextField} from '@mui/material';
import {ChangeEvent, useState} from 'react';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import UploadIcon from '@mui/icons-material/Upload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useAuth} from '../providers/AuthProvider.tsx';
import {useFileHook} from '../hooks/useFileHook.ts';
import {enqueueSnackbar} from 'notistack';

export default function Upload() {
  const {text} = useLanguage();
  const {user} = useAuth()
  const [isPublic, setIsPublic] = useState(false);
  const [links, setLinks] = useState<string[]>([]);
  const {uploadFiles, uploading} = useFileHook();

  if (!user) {
    return null;
  }

  const handleFilesUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const uploaded = await uploadFiles(
      Array.from(files),
      isPublic
    );

    setLinks(
      uploaded.map(
        (f) => `${window.location.origin}/api/file/${f.id}`
      )
    );
  };

  const handleClick = (link: string) => {
    enqueueSnackbar(
      text('Link copied', 'Link gekopieerd'),
      {variant: 'success'}
    );
    navigator.clipboard.writeText(link)
  }

  return (
    <GenericPage>
      <ContentCard className="grid gap-4">
        <h1>{text('Upload files', 'Bestanden uploaden')}</h1>
        <p>{text('Select who has access to the image/document.', 'Selecteer wie er toegang heeft tot de afbeelding/document.')}</p>
        <FormControlLabel
          control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}/>}
          label={text('Visible for everyone', 'Zichtbaar voor iedereen')}
        />
        <p>{text('Upload the image/document you want to use on the website.', 'Upload je afbeelding/document die je wil gebruiken op de website.')}</p>
        <Button
          component="label"
          variant="contained"
          startIcon={<UploadIcon/>}
          loading={uploading}
        >
          {text(
            'Upload images/documents',
            'Upload afbeeldingen/documenten'
          )}
          <input
            type="file"
            hidden
            multiple
            onChange={handleFilesUpload}
          />
        </Button>
        <p>{text('Copy the generated link to use in the markdown.', 'Kopieer de gegenereerde link om te gebruiken in de markdown.')}</p>
        {links.map((link) => (
          <TextField
            key={link}
            fullWidth
            value={link}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClick(link)}
                      edge="end"
                    >
                      <ContentCopyIcon/>
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
      </ContentCard>
    </GenericPage>
  );
}
