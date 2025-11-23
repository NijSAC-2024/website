import React from 'react';
import {useLoadWebsite, WebsiteContext} from './hooks/useState.ts';
import {Pages} from './Pages.tsx';
import ErrorBoundary from './error/ErrorBoundary.tsx';
import ThemeProvider from './providers/ThemeProvider.tsx';
import LanguageProvider from './providers/LanguageProvider.tsx';
import {CookiesProvider} from 'react-cookie';

const LazyNavBoundary = React.memo(
  function NavBoundary(website: ReturnType<typeof useLoadWebsite>) {
    return (
      <WebsiteContext.Provider value={website}>
        <Pages/>
      </WebsiteContext.Provider>
    );
  },
  (_prev, next) => next.state.nextRouterState !== null
);

function LoadWebsite() {
  const remails = useLoadWebsite();
  return <LazyNavBoundary {...remails} />;
}

export default function App() {
  return (
    <CookiesProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <LoadWebsite/>
          </ErrorBoundary>
        </LanguageProvider>
      </ThemeProvider>
    </CookiesProvider>
  );
}
