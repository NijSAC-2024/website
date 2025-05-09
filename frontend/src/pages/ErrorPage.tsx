import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';

interface ErrorPageProbs {
  error?: string;
}

export default function ErrorPage({ error }: ErrorPageProbs) {
  console.error(error);

  return (
    <GenericPage>
      <ContentCard className="p-7 grid justify-center">
        <h1 className="mx-auto text-9xl">Oops!</h1>
        <p className="mx-auto text-4xl">
          Sorry, an unexpected error has occurred.
        </p>
        <p className="mx-auto text-4xl">
          <i>{error}</i>
        </p>
      </ContentCard>
    </GenericPage>
  );
}
