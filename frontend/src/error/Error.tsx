import {WebsiteError} from './error';

export default function Error({error}: { error: WebsiteError }) {
  // TODO styling
  return (
    <>
      <p>{error.status}</p>
      <h1>
        You have found a secret place.
      </h1>
      <p>
        Unfortunately, this is only an error page. You may have mistyped the address, or the page has been moved to
        another URL.
      </p>
      <p>{error.message}</p>
      <a href="/">
        Take me back home
      </a>
    </>
  );
}
