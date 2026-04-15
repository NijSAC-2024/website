import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';
import {useLocations} from '../hooks/useLocations.ts';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useWebsite} from '../hooks/useState.ts';

export default function Location() {
  const {locations} = useLocations()
  const {text} = useLanguage();
  const { state } = useWebsite();
  const id = state.routerState.params['location_id'];
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