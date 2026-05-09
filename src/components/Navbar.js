import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

/* Logo public/ klasöründen sunuluyor — webpack bundle bağımsız, her zaman çalışır */
const LOGO_SRC = process.env.PUBLIC_URL + '/StudyZone.png';

const TRFlag = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, flexShrink: 0 }}>
    <rect width="16" height="11" fill="#E30A17"/>
    <circle cx="6.2" cy="5.5" r="2.5" fill="white"/>
    <circle cx="7.2" cy="5.5" r="2" fill="#E30A17"/>
    <polygon fill="white" points="9.8,5.5 10.5,4.4 10.8,5.7 12,5.1 11.3,6.2 12.3,6.6 11,6.7 11.2,8 10.3,7.1 9.5,7.9 9.8,6.7 8.7,6.5"/>
  </svg>
);

const GBFlag = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, flexShrink: 0 }}>
    <rect width="16" height="11" fill="#012169"/>
    <line x1="0" y1="0" x2="16" y2="11" stroke="white" strokeWidth="2.2"/>
    <line x1="16" y1="0" x2="0" y2="11" stroke="white" strokeWidth="2.2"/>
    <line x1="0" y1="0" x2="16" y2="11" stroke="#C8102E" strokeWidth="1.2"/>
    <line x1="16" y1="0" x2="0" y2="11" stroke="#C8102E" strokeWidth="1.2"/>
    <rect x="6.5" y="0" width="3" height="11" fill="white"/>
    <rect x="0" y="4" width="16" height="3" fill="white"/>
    <rect x="7.2" y="0" width="1.6" height="11" fill="#C8102E"/>
    <rect x="0" y="4.7" width="16" height="1.6" fill="#C8102E"/>
  </svg>
);

/* Minimal sticky top header */
export default function TopHeader() {
  const { isDark, toggleTheme }    = useTheme();
  const { i18n, t }                = useTranslation();
  const { user, logout }           = useAuth();
  const navigate                   = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const switchLang = () => i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr');
  const isEN = i18n.language === 'en';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    logout();
    setShowLogout(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="sz-top-header">
        {/* Logo */}
        <Link to="/" className="sz-top-brand" aria-label="StudyZone Home">
          {/* Wrapper pill — logoyu her iki temada görünür yapar */}
          <span className="sz-brand-logo-wrap">
            <img src={LOGO_SRC} alt="" className="sz-brand-logo" aria-hidden="true"
              style={{ width: 'auto', height: '22px' }} />
          </span>
          <span className="sz-brand-wordmark">
            <span className="sz-brand-s">S</span>tudy<span className="sz-brand-z">Z</span>one
          </span>
        </Link>

        <div className="sz-top-controls">
          {/* Language toggle pill */}
          <button className="sz-icon-btn" onClick={switchLang}
            title="Switch language" aria-label="Switch language">
            {isEN ? <GBFlag /> : <TRFlag />}
            <span>{isEN ? 'EN' : 'TR'}</span>
          </button>

          {/* Theme toggle */}
          <button className="sz-icon-btn sz-theme-btn" onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? '☀' : '☾'}
          </button>

          {/* Quick logout — only when logged in, subtle SVG icon */}
          {user && (
            <button
              className="sz-icon-btn sz-theme-btn"
              onClick={() => setShowLogout(true)}
              title={t('auth.logoutBtn')}
              aria-label={t('auth.logoutBtn')}
              style={{ color: 'var(--sz-muted)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {showLogout && (
        <div className="sz-otp-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowLogout(false)}>
          <div className="sz-otp-box" style={{ maxWidth: 360 }}>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
              background: 'rgba(var(--sz-primary-rgb), 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="var(--sz-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {t('auth.logoutConfirmTitle')}
            </h3>
            <p style={{ color: 'var(--sz-muted)', fontSize: '0.87rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              {t('auth.logoutConfirmDesc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button className="btn-sz-primary btn-full" onClick={handleLogout}>
                {t('auth.logoutConfirm')}
              </button>
              <button className="btn-sz-ghost btn-full" onClick={() => setShowLogout(false)}>
                {t('auth.logoutCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
