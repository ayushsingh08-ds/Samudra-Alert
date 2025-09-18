// src/pages/components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pd-container">
          <div className="pd-glass-card error-boundary-card">
            <div className="pd-card-title">⚠️ Something went wrong</div>
            <div className="error-content">
              <p className="error-message">
                {this.state.error?.message || "An unexpected error occurred in the dashboard"}
              </p>
              <div className="error-actions">
                <button 
                  className="pd-btn"
                  onClick={() => this.setState({ hasError: false, error: null })}
                >
                  🔄 Try Again
                </button>
                <button 
                  className="pd-btn"
                  onClick={() => window.location.reload()}
                >
                  🔃 Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
