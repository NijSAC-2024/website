import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import GenericPage from './GenericPage.tsx';
import ContentCard from '../components/ContentCard.tsx';

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'Unknown error';
  }

  console.error(error);

  return (
    <GenericPage>
      <ContentCard className="p-7 grid justify-center">
        <h1 className="mx-auto text-9xl">Oops!</h1>
        <p className="mx-auto text-4xl">Sorry, an unexpected error has occurred.</p>
        <p className="mx-auto text-4xl">
          <i>{errorMessage}</i>
        </p>
      </ContentCard>
    </GenericPage>
  );
}
