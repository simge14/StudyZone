import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ── Expertise level from course count ── */
function expertiseLevel(count, t) {
  if (count >= 5) return { label: t('home.levelExpert'),       color: '#B7791F', bg: 'rgba(246,194,35,0.15)', pct: 100 };
  if (count >= 3) return { label: t('home.levelIntermediate'), color: '#5C3FE8', bg: 'rgba(196,179,245,0.2)', pct: 66  };
  if (count >= 1) return { label: t('home.levelBeginner'),     color: '#0A0075', bg: 'rgba(10,0,117,0.08)',   pct: 33  };
  return           { label: t('home.levelNone'),               color: 'var(--sz-muted)', bg: 'var(--sz-border)', pct: 0 };
}

/* ── Expertise Progress Card (shown when logged in) ── */
function ExpertiseCard({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [liveCount, setLiveCount] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/users/profile').catch(() => null),
      api.get('/api/barters').catch(() => null),
    ]).then(([pRes, bRes]) => {
      if (pRes) setProfile(pRes.data);
      if (bRes) {
        /* Count "active" barters as live activity */
        const active = (bRes.data || []).filter((b) => b.status === 'active').length;
        setLiveCount(active);
      }
    });
  }, []);

  const courseCount = (profile?.goodAt?.length ?? 0) + (profile?.wantToLearn?.length ?? 0);
  const exp = expertiseLevel(courseCount, t);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
      {/* Welcome bar */}
      <div className="sz-glass" style={{
        borderRadius: 'var(--sz-radius)',
        padding: '1rem 1.1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
            {t('home.welcomeBack')}
          </p>
          <p style={{ margin: '0.15rem 0 0', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em' }}>
            {(user?.name || 'Öğrenci').split(' ')[0]} 👋
          </p>
        </div>
        {liveCount !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--sz-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {liveCount}
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--sz-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
              Aktif Barter
            </div>
          </div>
        )}
      </div>

      {/* Expertise card */}
      <div className="sz-card" style={{ padding: '1rem 1.1rem', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
              {t('home.expertiseTitle')}
            </p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--sz-muted)' }}>
              {t('home.expertiseSubtitle')}
            </p>
          </div>
          <span style={{
            background: exp.bg, color: exp.color,
            fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.7rem',
            borderRadius: '50px', letterSpacing: '0.05em', whiteSpace: 'nowrap',
          }}>
            {exp.label}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--sz-border)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{
            height: '100%', width: `${exp.pct}%`, background: exp.color,
            borderRadius: 3, transition: 'width 0.6s ease',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--sz-muted)', fontWeight: 600 }}>
            {courseCount > 0 ? `${courseCount} ders` : t('home.noCoursesHint')}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--sz-primary)', fontWeight: 700 }}>
            Profili Gör →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature cards config ── */
const FEATURES = [
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
    key: 'feat1', iconBg: 'rgba(10,0,117,0.08)', iconColor: '#0A0075',
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    key: 'feat2', iconBg: 'rgba(196,179,245,0.3)', iconColor: '#5C3FE8',
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    key: 'feat3', iconBg: 'rgba(72,187,120,0.12)', iconColor: '#276749',
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    key: 'feat4', iconBg: 'rgba(246,194,35,0.15)', iconColor: '#B7791F',
  },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isEN = i18n.language === 'en';

  return (
    <div className="sz-page" style={{ paddingTop: 0 }}>

      {/* ── Hero ── */}
      <div className="sz-hero">
        {/* "Only @isik" pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(10,0,117,0.07)', borderRadius: '50px',
          padding: '0.28rem 0.9rem', marginBottom: '1.1rem',
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
          color: 'var(--sz-primary)', textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#48BB78', display: 'inline-block' }} />
          @isik.edu.tr Only
        </div>

        {/* Motto */}
        <h1 className="sz-hero-title">
          {isEN ? (
            <>Study Together,<br /><span>Succeed Together</span></>
          ) : (
            <>Birlikte Öğren,<br /><span>Birlikte Başar</span></>
          )}
        </h1>

        {/* Sub-motto */}
        <p style={{
          fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--sz-muted)', textTransform: 'uppercase', marginBottom: '1rem',
          position: 'relative', zIndex: 1,
        }}>
          {t('home.motto')}
        </p>

        <p className="sz-hero-sub">{t('home.sub')}</p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {!user ? (
            <>
              <Link to="/register">
                <button className="btn-sz-primary" style={{ fontSize: '0.95rem', padding: '0.75rem 2rem' }}>
                  {t('home.ctaRegister')} →
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-sz-ghost" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
                  {t('home.ctaLogin')}
                </button>
              </Link>
            </>
          ) : (
            <Link to="/barter">
              <button className="btn-sz-primary" style={{ fontSize: '0.95rem', padding: '0.75rem 2rem' }}>
                {t('nav.barter')} →
              </button>
            </Link>
          )}
        </div>

        {/* Expertise card for logged-in users */}
        {user && <ExpertiseCard user={user} />}

        {/* Feature cards */}
        <div className="sz-feature-grid" style={{ marginTop: user ? '1.5rem' : '1.75rem' }}>
          {FEATURES.map(({ svg, key, iconBg, iconColor }) => (
            <div key={key} className="sz-feature-card">
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: iconBg, color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.6rem',
              }}>
                {svg}
              </div>
              <div className="sz-feature-title">{t(`home.${key}Title`)}</div>
              <div className="sz-feature-desc">{t(`home.${key}Desc`)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer constraint strip ── */}
      <div style={{
        textAlign: 'center',
        padding: '1.25rem',
        borderTop: '1px solid var(--sz-border)',
        marginTop: '1.5rem',
        color: 'var(--sz-muted)',
        fontSize: '0.68rem',
        letterSpacing: '0.08em',
        fontWeight: 700,
        textTransform: 'uppercase',
      }}>
        No Money · No Credits · Pure Peer Learning
      </div>
    </div>
  );
}
