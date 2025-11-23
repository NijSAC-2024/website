import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage.tsx';
import { WebsiteError } from './error';

interface Props {
  children?: ReactNode;
}

interface State {
  error?: WebsiteError;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: undefined,
  };

  public static getDerivedStateFromError(e: WebsiteError): State {
    // Update state so the next render will show the fallback UI.
    return { error: e };
  }

  public componentDidCatch(error: WebsiteError, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.error) {
      if (this.state.error instanceof WebsiteError) {
        return <ErrorPage error={this.state.error} />;
      }

      return <ErrorPage error={new WebsiteError(`Unexpected error: ${this.state.error}`, 500)} />;
    }

    return this.props.children;
  }
}
