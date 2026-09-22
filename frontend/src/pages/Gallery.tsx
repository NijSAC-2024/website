import Gallery from '../components/Gallery.tsx';
import {useLoggedIn} from '../util.ts';

export default function GalleryPage() {
  useLoggedIn();
  return (
    <Gallery dialogOpen={true} toggleDialogOpen={() => true}/>
  );
}
