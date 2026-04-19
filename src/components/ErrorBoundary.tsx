import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
  label?: string;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ""}]`,
      error,
      info,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8 bg-bg-primary">
        <AlertTriangle size={40} className="text-accent-red" />
        <h2 className="text-text-primary text-[18px] font-medium">
          Something went wrong
        </h2>
        <p className="text-text-muted text-[13px] font-mono max-w-[560px] text-center break-words">
          {this.state.error.message}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 h-8 text-[13px] text-text-muted hover:text-text-primary rounded-md transition"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-4 h-8 text-[13px] font-medium bg-accent-blue text-bg-primary rounded-md hover:brightness-110 transition"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
