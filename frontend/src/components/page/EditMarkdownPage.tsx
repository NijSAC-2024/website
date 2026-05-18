import {Button, FormControlLabel, Switch, TextField} from '@mui/material';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import GenericPage from '../../pages/GenericPage.tsx';
import {usePageHook} from '../../hooks/usePageHook.ts';
import {PageContent} from '../../types.ts';
import {ChangeEvent, useState} from 'react';
import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import SaveButton from '../page/SaveButton.tsx';
import {useFileHook} from '../../hooks/useFileHook.ts';

export default function EditMarkdownPage() {
  const {slug} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {text} = useLanguage();
  const {usePage, createPage, updatePage} = usePageHook();
  const existing = usePage(slug);
  const {uploadFile, uploading} = useFileHook();

  const initial: PageContent = existing ?? {
    name: {en: 'New page', nl: 'Nieuwe pagina'},
    slug: 'new-page',
    content: {en: '', nl: ''},
    image: undefined,
    isPublic: false,
  };

  const [content, setContent] = useState<PageContent>(initial)

  const isCreate = location.pathname === '/pages/new';


  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const uploaded = await uploadFile(
      file,
      true
    );
    setContent({
      ...content,
      image: uploaded[0].id,
    });
  };

  const handleSave = async () => {
    if (isCreate) {
      const page = await createPage(content);
      navigate(`/${page.slug}`);
    } else if (existing) {
      const page = await updatePage(existing.pageId, content);
      navigate(`/${page.slug}`);
    }
  };

  return (
    <GenericPage image={content.image ? `/api/file/${content.image}` : undefined}>
      <SaveButton id={existing?.pageId ?? ''} handleSave={handleSave}/>
      <div className="grid gap-5 mt-[-9.3rem]">
        <div className="mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit"
              onClick={() => navigate(`${slug ? `/${slug}` : '/pages'}`)}>
              {text(`Back to Page${!slug ? 's' : ''}`, `Terug naar Pagina${!slug ? '\'s' : ''}`)}
            </Button>
          </div>
        </div>
        <div
          className="w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)]">
          <img className="w-full aspect-4/2 object-cover"
            src={content.image ? `/api/file/${content.image}` : '/images/test-header-image.jpg'}
            alt="Page"/>
          <div className="p-5 grid gap-3">
            <Button
              component="label"
              variant="contained"
              startIcon={<PhotoCameraIcon/>}
              loading={uploading}
            >
              {text('Upload image', 'Afbeelding uploaden')}

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Button>
            <div className="grid md:grid-cols-2 gap-3">
              <TextField label={text('English name', 'Engelse naam')} value={content.name.en}
                onChange={(e) => setContent({
                  ...content,
                  name: {...content.name, en: e.target.value}
                })}/>
              <TextField label={text('Dutch name', 'Nederlandse naam')} value={content.name.nl}
                onChange={(e) => setContent({
                  ...content,
                  name: {...content.name, nl: e.target.value}
                })}/>
            </div>
            <TextField label="Slug" value={content.slug}
              onChange={(e) => setContent({...content, slug: e.target.value})}/>
            <FormControlLabel control={<Switch checked={content.isPublic} onChange={(e) => setContent({
              ...content,
              isPublic: e.target.checked
            })}/>} label={text('Public page', 'Publieke pagina')}/>
          </div>
          <MarkdownEditor value={content.content}
            onChange={(value) => setContent({...content, content: value})}/>
        </div>
      </div>
    </GenericPage>
  );
}
