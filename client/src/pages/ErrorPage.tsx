import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
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
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center ">
      <h1 className="text-white text-9xl">Oops!</h1>
      <p className="text-white text-4xl">Sorry, an unexpected error has occurred.</p>
      <p className="text-white text-4xl">
        <i>{errorMessage}</i>
      </p>
    </div>
  );
}
