import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

/* ── SVG icons (no external lib needed) ── */
const Icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  barter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  ),
  buddy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  pomodoro: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  spots: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const ITEMS = [
  { to: '/',            labelKey: 'nav.home',        icon: Icons.home,     end: true,  auth: false },
  { to: '/barter',      labelKey: 'nav.barter',      icon: Icons.barter,   end: false, auth: true  },
  { to: '/learnership', labelKey: 'nav.learnership', icon: Icons.buddy,    end: false, auth: true  },
  { to: '/pomodoro',    labelKey: 'nav.pomodoro',    icon: Icons.pomodoro, end: false, auth: true  },
  { to: '/locations',   labelKey: 'nav.locations',   icon: Icons.spots,    end: false, auth: false },
  { to: '/profile',     labelKey: 'nav.profile',     icon: Icons.profile,  end: false, auth: true  },
];

export default function BottomNav() {
  const { t }      = useTranslation();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  return (
    <nav className="sz-bottom-nav" aria-label="Bottom navigation">
      {ITEMS.map(({ to, labelKey, icon, end, auth }) => {
        if (auth && !user) {
          return (
            <button key={to} className="sz-nav-item"
              onClick={() => navigate('/login')}
              aria-label={t(labelKey)}>
              <span className="sz-nav-icon">{icon}</span>
              <span>{t(labelKey)}</span>
            </button>
          );
        }
        return (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sz-nav-item${isActive ? ' active' : ''}`}
            aria-label={t(labelKey)}>
            <span className="sz-nav-icon">{icon}</span>
            <span>{t(labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
