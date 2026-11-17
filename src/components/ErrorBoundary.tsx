import { Component, type ReactNode } from 'react';

/** Catches render/lazy-chunk errors (e.g. an open tab after a redeploy) instead of showing a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert">
        <h1>לא הצלחנו לטעון את העמוד</h1>
        <p>ייתכן שהאתר עודכן בזמן שהעמוד היה פתוח.</p>
        <button type="button" className="button button-primary" onClick={() => window.location.reload()}>
          טענו מחדש
        </button>
      </div>
    );
  }
}
