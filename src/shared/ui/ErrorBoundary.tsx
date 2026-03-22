import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled UI error", { error, info });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="status-page app-error-boundary">
          <h1>Application error</h1>
          <p>{this.state.errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              window.location.assign("/");
            }}
          >
            Go to home
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}