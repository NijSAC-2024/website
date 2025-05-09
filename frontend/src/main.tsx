import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import AppProvider from './providers/AppProvider.tsx';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
