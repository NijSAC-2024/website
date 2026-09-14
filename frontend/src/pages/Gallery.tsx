import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {Button, Chip, FormControlLabel, IconButton, InputAdornment, Switch, TextField} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {ChangeEvent, useMemo, useState} from 'react';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import LoadingPage from '../components/loading/LoadingPage.tsx';
import {useFileHook} from '../hooks/useFileHook.ts';
import {inCommittee, useLoggedIn} from '../util.ts';
import UploadIcon from '@mui/icons-material/Upload';
import {useAuth} from '../providers/AuthProvider.tsx';
import {useUserHook} from '../hooks/useUserHook.ts';
import {FileMetadata} from '../types.ts';

const PAGE_SIZE = 24;

export default function Gallery() {
  const {text} = useLanguage();
  const [offset, setOffset] = useState(0);
  const {useFiles} = useFileHook()
  const files = useFiles(PAGE_SIZE, offset);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const {user} = useAuth();
  const {useUserCommittees} = useUserHook();
  const myCommittees = useUserCommittees(user?.id)
  const [isPublic, setIsPublic] = useState(false);
  const {uploadFiles, uploading} = useFileHook();
  const [search, setSearch] = useState('');
  useLoggedIn();

  const handleFilesUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    await uploadFiles(
      Array.from(files),
      isPublic
    );
  };

  const handleCopy = async (id: string, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return files ?? [];
    }
    return (files ?? []).filter((f) =>
      `${f.originalFilename}`.toLowerCase().includes(q),
    );
  }, [files, search]);

  if (!files || !inCommittee(myCommittees)) {
    return <LoadingPage/>;
  }


  const fileCard = (file: FileMetadata) => {
    const url = `${window.location.origin}/api/file/${file.id}`;
    const isImage = file.mimeType?.startsWith('image/');
    return (
      <div key={file.id} className="h-full">
        <div className="w-full h-full relative rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)]">
          {isImage ? (
            <img
              className="w-full aspect-4/2 object-cover"
              src={url}
              alt={file.originalFilename}
            />
          ) : (
            <div className="w-full aspect-4/2 flex items-center justify-center bg-black/5 dark:bg-white/5">
              <InsertDriveFileIcon sx={{fontSize: 48}}/>
            </div>
          )}
          <div className="p-4 grid gap-2">
            {file.isPublic && (
              <Chip
                key={`${file.id}`}
                label={'Public'}
                className="absolute uppercase font-semibold top-5 left-5"
                color="primary"
                size="small"
              />
            )}
            <span className="truncate font-medium" title={file.originalFilename}>
              {file.originalFilename}
            </span>
            <TextField
              size="small"
              fullWidth
              value={url}
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleCopy(file.id, url)}>
                        {copiedId === file.id ? <CheckIcon/> : <ContentCopyIcon/>}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <GenericPage>
      <ContentCard className="grid gap-2">
        <h1>{text('Gallery', 'Galerij')}</h1>
        <p>
          {text(
            'All uploaded files. Copy a link to use it elsewhere.',
            'Alle geüploade bestanden. Kopieer een link om elders te gebruiken.'
          )}
        </p>
        <TextField
          label={text('Search', 'Zoeken')}
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </ContentCard>

      <ContentCard className="grid gap-2 mt-4">
        <h1>{text('Upload', 'Uploaden')}</h1>
        <p>{text('1. Select who has access to the image/document.', '1. Selecteer wie er toegang heeft tot de afbeelding/document.')}</p>
        <FormControlLabel
          control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}/>}
          label={text('Visible for everyone', 'Zichtbaar voor iedereen')}
        />
        <p>{text('2. Upload the image/document you want to use on the website.', '2. Upload je afbeelding/document die je wil gebruiken op de website.')}</p>
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
        <p>{text('3. Copy the generated link below to use in the markdown.', '3. Kopieer de gegenereerde link hieronder om te gebruiken in de markdown.')}</p>
      </ContentCard>

      <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5 mt-4">
        {filtered.map((file) => fileCard(file))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <Button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
          {text('Previous', 'Vorige')}
        </Button>
        <Button disabled={files.length < PAGE_SIZE} onClick={() => setOffset(offset + PAGE_SIZE)}>
          {text('Next', 'Volgende')}
        </Button>
      </div>
    </GenericPage>
  );
}