import {WebsiteError} from './error';
import GenericPage from '../pages/GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';

export default function ErrorPage({error}: { error: WebsiteError }) {
  // TODO styling
  return (
    <GenericPage>
      <ContentCard className="grid justify-center dark:text-white">
        <h1 className="mx-auto text-9xl">Oops!</h1>
        <p className="mx-auto text-4xl">
          Sorry, an unexpected error has occurred. ({error.status})
        </p>
        <p className="mx-auto text-4xl">
          <i>{error.message}</i>
        </p>
      </ContentCard>
    </GenericPage>
  );
}
