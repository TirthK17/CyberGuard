import React, { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary captured an unhandled runtime error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleCopyDetails = async () => {
    const { error, errorInfo } = this.state;
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      // Fallback if clipboard fails
      console.warn("Failed to copy error report to clipboard");
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, copied } = this.state;
      const { fallbackTitle = "System Anomaly Encountered" } = this.props;

      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas text-text-pure p-4">
          <div className="glass max-w-lg w-full rounded-3xl p-8 border border-danger/30 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 border border-danger/30 text-danger text-3xl">
              <i className="ti ti-alert-triangle" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-danger font-bold">
                Runtime Error Containment
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure">
                {fallbackTitle}
              </h1>
              <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
                CyberGuard intercepted an unexpected rendering error. Your local defense data and certificates are safely preserved.
              </p>
            </div>

            {error?.message && (
              <div className="p-3.5 rounded-xl bg-surface border border-border text-left font-mono text-[11px] text-danger/90 break-all overflow-x-auto max-h-32">
                <span className="text-text-ash block font-bold mb-1">Exception Details:</span>
                {error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                onClick={this.handleReload}
                className="flex-1 text-xs py-2.5 font-bold"
              >
                <i className="ti ti-rotate-clockwise mr-1.5" /> Reload Application
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleCopyDetails}
                className="flex-1 text-xs py-2.5"
              >
                <i className={`ti ${copied ? "ti-check text-emerald-400" : "ti-copy"} mr-1.5`} />
                {copied ? "Diagnostics Copied!" : "Copy Diagnostics"}
              </Button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="text-xs text-text-ash hover:text-text-pure transition underline decoration-dotted cursor-pointer"
              >
                Return to Safe Home Screen
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
