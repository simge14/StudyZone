import React, { useEffect, useState } from 'react';

/*
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 *
 *   setToast({ type: 'error' | 'success' | 'warning', message: '...' });
 *
 * Auto-dismisses after `duration` ms (default 4 500).
 */
export default function Toast({ toast, onClose, duration = 4500 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const colors = {
    error:   { bg: '#FFF5F5', border: '#FEB2B2', text: '#C53030', icon: '✕' },
    success: { bg: '#F0FFF4', border: '#9AE6B4', text: '#276749', icon: '✓' },
    warning: { bg: '#FFFBEB', border: '#FAD689', text: '#92400E', icon: '⚠' },
  };
  const c = colors[toast.type] || colors.error;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={onClose}
      style={{
        position: 'fixed',
        bottom: `calc(var(--sz-bottom-h, 64px) + 12px)`,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '120%'})`,
        width: 'calc(100% - 2rem)',
        maxWidth: 440,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 'var(--sz-radius, 8px)',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
        zIndex: 2000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontWeight: 700, color: c.text, fontSize: '1rem', lineHeight: 1.4, flexShrink: 0 }}>
        {c.icon}
      </span>
      <span style={{ color: c.text, fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
        {toast.message}
      </span>
      <span style={{ color: c.text, opacity: 0.5, fontSize: '0.8rem', flexShrink: 0, paddingTop: '0.1rem' }}>✕</span>
    </div>
  );
}
