import {
  Button, Checkbox,
  Chip, Dialog, DialogActions,
  DialogContent,
  FormControlLabel, IconButton,
  Tab,
  TextField
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {ChangeEvent, useMemo, useState} from 'react';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useFileHook} from '../hooks/useFileHook.ts';
import {inCommittee, isAdminOrBoard, useLoggedIn} from '../util.ts';
import UploadIcon from '@mui/icons-material/Upload';
import {useAuth} from '../providers/AuthProvider.tsx';
import {useUserHook} from '../hooks/useUserHook.ts';
import {FileMetadata} from '../types.ts';
import {TabContext, TabList, TabPanel} from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import AreYouSure from './AreYouSure.tsx';

const PAGE_SIZE = 18;

interface GalleryProps {
  dialogOpen: boolean;
  toggleDialogOpen: () => void;
  onSelect?: (file: FileMetadata) => void;
}

export default function Gallery({dialogOpen, toggleDialogOpen, onSelect}: GalleryProps) {
  const {text} = useLanguage();
  const [offset, setOffset] = useState(0);
  const {useFiles} = useFileHook()
  const files = useFiles(PAGE_SIZE, offset);
  const {user} = useAuth();
  const {useUserCommittees} = useUserHook();
  const myCommittees = useUserCommittees(user?.id)
  const [isPublic, setIsPublic] = useState(true);
  const {uploadFiles, uploading, deleteFile} = useFileHook();
  const [search, setSearch] = useState('');
  const [value, setValue] = useState('1');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | undefined>(undefined)
  useLoggedIn();

  const toggleDeleteDialog = () => {
    setDeleteDialogOpen(prevState => !prevState)
  }

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return files ?? [];
    }
    return (files ?? []).filter((f) =>
      `${f.originalFilename}`.toLowerCase().includes(q),
    );
  }, [files, search]);

  if (!(inCommittee(myCommittees) || isAdminOrBoard(user?.roles))) {
    return null;
  }

  const fileCard = (file: FileMetadata) => {
    const url = `${window.location.origin}/api/file/${file.id}`;
    const isImage = file.mimeType?.startsWith('image/');
    const handleSelect = () => {
      if (!onSelect) {
        return;
      }
      onSelect(file);
    };

    return (
      <div key={file.id} className="h-full">
        <div
          className="w-full h-full relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
          {isImage ? (
            <img
              onClick={handleSelect}
              className="w-full aspect-4/2 object-cover hover:cursor-pointer"
              src={url}
              alt={file.originalFilename}
            />
          ) : (
            <div onClick={handleSelect}
              className="w-full aspect-4/2 flex items-center justify-center bg-black/5 dark:bg-white/5 hover:cursor-pointer">
              <InsertDriveFileIcon sx={{fontSize: 48}}/>
            </div>
          )}
          <div className="p-4 grid gap-2">
            {file.isPublic && (
              <Chip
                key={`${file.id}`}
                label={text('Public', 'Openbaar')}
                className="absolute uppercase font-semibold xl:top-5 xl:left-5 top-2 left-2"
                color="primary"
                size="small"
              />
            )}
            <div className="absolute uppercase font-semibold top-1 right-1 xl:top-4 xl:right-4">
              <IconButton onClick={() => {
                setSelectedFile(file);
                toggleDeleteDialog()
              }} color="error">
                <DeleteIcon/>
              </IconButton>
            </div>
            <p className="truncate font-medium" title={file.originalFilename}>
              {file.originalFilename}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={dialogOpen} onClose={toggleDialogOpen} fullScreen>
        <DialogContent sx={{p: 0}}>
          <TabContext value={value}>
            <TabList
              onChange={(_, newValue) => setValue(newValue)}
              sx={{borderBottom: 1, borderColor: 'divider'}}
            >
              <Tab label={text('Gallery', 'Gallerij')} value="1"/>
              <Tab label={text('Upload', 'Uploaden')} value="2"/>
            </TabList>
            <TabPanel value="1" sx={{p: 1.5}}>
              <TextField
                label={text('Search', 'Zoeken')}
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="grid xl:grid-cols-6 grid-cols-2 gap-5 mt-4">
                {filtered.map((file) => fileCard(file))}
              </div>
            </TabPanel>
            <TabPanel value="2" sx={{height: '85vh'}}>
              <div className="flex h-full w-full justify-center items-center">
                <div
                  className="p-5 grid gap-1 place-items-center rounded-2xl border border-[rgba(255,255,255,0.1)]">
                  <p
                    className="text-center">{text('Select who has access to the image/document.', 'Selecteer wie er toegang heeft tot de afbeelding/document.')}</p>
                  <FormControlLabel
                    control={<Checkbox checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}/>}
                    label={text('Visible for everyone', 'Zichtbaar voor iedereen')}
                  />
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
                  <p className="text-center">{text('Maximum upload size: 50 MB.', 'Maximale uploadgrootte: 50 MB.')}</p>
                </div>
              </div>
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          {value === '1' ? (
            <>
              <div className="flex justify-center gap-4 w-full">
                <Button disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
                  {text('Previous', 'Vorige')}
                </Button>
                <Button disabled={filtered.length < PAGE_SIZE}
                  onClick={() => setOffset(offset + PAGE_SIZE)}>
                  {text('Next', 'Volgende')}
                </Button>
              </div>
              <div className="absolute right-[1.1rem]">
                <Button onClick={toggleDialogOpen}>{text('Close', 'Sluit')}</Button>
              </div>
            </>
          ) : (
            <Button onClick={toggleDialogOpen}>{text('Close', 'Sluit')}</Button>
          )}
        </DialogActions>
      </Dialog>
      <AreYouSure open={deleteDialogOpen} onConfirm={() => {
        deleteFile(selectedFile!.id);
        toggleDeleteDialog()
      }}
      onCancel={toggleDeleteDialog}
      message={text('You are about to delete this file.', 'Je staat op het punt om dit bestand te verwijderen.')}/>
    </>
  );
}