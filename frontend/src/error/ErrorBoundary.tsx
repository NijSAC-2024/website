import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage.tsx';
import {AppError, ApiError, UserError} from './error';

interface Props {
  children?: ReactNode;
}

interface State {
  error?: AppError;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { error: undefined };
  public static setError?: (error: unknown) => void;

  constructor(props: Props) {
    super(props);

    ErrorBoundary.setError = (error: unknown) => {
      const normalized = ErrorBoundary.normalizeError(error);

      if (!ErrorBoundary.isFatal(error)) {return;}

      this.setState({ error: normalized });
    };
  }

  public static getDerivedStateFromError(error: unknown): State {
    return { error: ErrorBoundary.normalizeError(error) };
  }

  public componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private static isFatal(error: unknown): boolean {
    if (error instanceof UserError) {return false;}
    if (error instanceof ApiError || error instanceof AppError) {
      return error.status >= 500;
    }
    return true;
  }

  private static normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {return error;}

    if (error instanceof ApiError) {
      return new AppError(error.message, error.status);
    }

    if (error instanceof UserError) {
      return new AppError(error.message, error.status);
    }

    if (error instanceof Error) {
      return new AppError(error.message, 500);
    }

    if (typeof error === 'string') {
      return new AppError(error, 500);
    }

    return new AppError('Unexpected unknown error', 500);
  }

  public render() {
    if (this.state.error) {
      return <ErrorPage error={this.state.error} />;
    }

    return this.props.children;
  }
}