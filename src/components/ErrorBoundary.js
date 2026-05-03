import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Beklenmedik bir hata oluştu.' };
  }

  componentDidCatch(error, info) {
    console.error('[StudyZone]', error, info.componentStack);
  }

  handleRetry = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '2.5rem' }}>⚠</div>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Bir şeyler yanlış gitti</h2>
          <p style={{ color: 'var(--sz-muted)', fontSize: '0.88rem', maxWidth: 320, margin: 0, lineHeight: 1.55 }}>
            {this.state.message}
          </p>
          <button
            className="btn-sz-outline"
            style={{ marginTop: '0.5rem' }}
            onClick={this.handleRetry}
          >
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
