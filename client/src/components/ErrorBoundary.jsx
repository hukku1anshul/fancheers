import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-pitch-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-pitch-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-white/10 flex flex-col items-center">
            <span className="text-5xl mb-4">🏟️</span>
            <h2 className="text-xl sm:text-2xl font-black mb-2">Stadium Refreshed</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
              A temporary rendering glitch occurred. Tap below to reconnect with the live fan network.
            </p>
            {this.state.error && (
              <pre className="bg-slate-100 dark:bg-pitch-950 p-3 rounded-xl text-xs text-red-600 dark:text-red-400 max-w-full overflow-x-auto text-left mb-6 w-full font-mono">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-2xl bg-stadium-turf text-white font-extrabold shadow-lg shadow-stadium-turf/30 active:scale-95 transition"
            >
              Reload FanPulse
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
