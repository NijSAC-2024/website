import {useState, ChangeEvent} from 'react';
import {Button, TextField} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import GenericPage from '../../pages/GenericPage.tsx';
import {useLanguage} from '../../providers/LanguageProvider.tsx';
import {CommitteeContent} from '../../types.ts';
import SaveButton from './SaveButton.tsx';
import MarkdownEditor from '../markdown/MarkdownEditor.tsx';
import {useWebsite} from '../../hooks/useState.ts';
import {useCommittees} from '../../hooks/useCommittees.ts';

export default function EditCommittee() {
  const {text} = useLanguage();
  const [uploading, setUploading] = useState(false);
  const {navigate} = useWebsite();
  const {committee, createCommittee, updateCommittee} = useCommittees();
  const {state: {routerState: {params, name: routeName}}} = useWebsite();

  const committee_id = params.committee_id;

  let initialCommittee: CommitteeContent | null = committee;
  if (routeName === 'committees.new') {
    initialCommittee = {
      name: {en: 'New committee', nl: 'Nieuwe commissie'},
      description: {en: '', nl: ''},
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/76/52/1b/76521bcd-7c16-6404-b845-be35fc720792/AppIcon-0-0-1x_U007epad-0-85-220.png/1200x600wa.png'
    };
  }

  const [committeeContent, setCommitteeContent] = useState<CommitteeContent | null>(initialCommittee);

  if (!committeeContent) {
    return <></>;
  }

  const handleCommitteeChange = (changes: Partial<CommitteeContent>) => {
    setCommitteeContent({...committeeContent, ...changes});
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append(file.name, file);
      fetch('/api/file', {
        method: 'POST',
        body: formData
      }).then((response) => response.json()).then((uploadInfo) => {
        handleCommitteeChange({image: uploadInfo[0].id});
        setUploading(false);
      });
    }
  };

  const handleSave = async () => {
    if (committee_id) {
      await updateCommittee(committee_id, committeeContent);
      navigate('committees.committee', {committee_id});
    } else {
      await createCommittee(committeeContent);
      navigate('committees');
    }
  };

  const imageUrl = committeeContent.image
    ? committeeContent.image.startsWith('https://')
      ? committeeContent.image
      : `/api/file/${committeeContent.image}`
    : '/images/test-header-image.jpg';

  return (
    <GenericPage image={imageUrl}>
      <SaveButton id={committee_id ?? ''} handleSave={handleSave}/>
      <div className="grid xl:grid-cols-3 gap-5 mt-[-9.3rem]">
        <div className="xl:col-span-3 mb-[-0.5rem] flex justify-between">
          <div className="bg-white dark:bg-[#121212] rounded-[20px] inline-block">
            <Button color="inherit" onClick={() => navigate('committees')}>
              {text('Back to Committees', 'Terug naar Commissies')}
            </Button>
          </div>
        </div>

        <div
          className="w-full rounded-2xl bg-inherit xl:col-span-2 xl:row-span-2 border border-[rgba(1,1,1,0.1)] overflow-hidden dark:border-[rgba(255,255,255,0.1)] flex flex-col">
          <img className="w-full aspect-[4/2] object-cover" src={imageUrl} alt="Committee"/>
          <div className="p-5 grid gap-5">
            {/* Image upload */}
            <form encType="multipart/form-data" action="/file" method="post">
              <Button
                fullWidth
                component="label"
                variant="contained"
                loading={uploading}
                color="primary"
                aria-label={text('Change Image', 'Afbeelding Wijzigen')}
                className="mx-auto"
                startIcon={<PhotoCameraIcon/>}
              >
                {text('Upload Image', 'Afbeelding Uploaden')}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </form>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label={text('Name English*', 'Naam Engels*')}
                value={committeeContent.name.en}
                onChange={(e) =>
                  handleCommitteeChange({
                    name: {...committeeContent.name, en: e.target.value}
                  })
                }
              />
              <TextField
                label={text('Name Dutch*', 'Naam Nederlands*')}
                value={committeeContent.name.nl}
                onChange={(e) =>
                  handleCommitteeChange({
                    name: {...committeeContent.name, nl: e.target.value}
                  })
                }
              />
            </div>
          </div>

          <div>
            <MarkdownEditor
              initialMarkdown={committeeContent.description}
              handleMarkdown={(markdown) => handleCommitteeChange({description: markdown})}
            />
          </div>
        </div>
      </div>
    </GenericPage>
  );
}
