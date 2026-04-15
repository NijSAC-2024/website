import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {useLocations} from '../hooks/useLocations.ts';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useParams} from 'react-router-dom';

export default function Location() {
  const {locations} = useLocations()
  const {text} = useLanguage();
  const params = useParams();
  const id = params.location_id
  const location = locations.find(loc => loc.id === id) ?? locations[0];

  return (
    <GenericPage>
      <ContentCard>
        <h1>{text(location.name)}</h1>
        { (location.description?.en || location.description?.nl) && (
          <p>{text(location.description)}</p>
        )}
      </ContentCard>
    </GenericPage>
  );
}