import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ── Expertise level — thresholds: 1 course=Beginner, 3=Intermediate, 5=Expert ── */
function expertiseLevel(count, t) {
  if (count >= 5) return { label: t('home.levelExpert'),       color: '#B7791F',           bg: 'rgba(246,194,35,0.15)',              pct: 100 };
  if (count >= 3) return { label: t('home.levelIntermediate'), color: 'var(--sz-accent)',   bg: 'rgba(var(--sz-secondary-rgb),0.2)',  pct: 66  };
  if (count >= 1) return { label: t('home.levelBeginner'),     color: 'var(--sz-primary)',  bg: 'rgba(var(--sz-primary-rgb),0.08)',   pct: 33  };
  return           { label: t('home.levelNone'),               color: 'var(--sz-muted)',    bg: 'var(--sz-border)',                   pct: 0   };
}

/* ── Confetti ── */
const CONFETTI_COLORS = ['#C4B3F5', '#0A0075', '#F6C23E', '#48BB78', '#FC8181', '#9AE6B4', '#5C3FE8'];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left:     ((i * 3.125 + 1.5) % 100).toFixed(1),
      delay:    ((i * 0.12) % 2.4).toFixed(2),
      duration: (2.5 + (i % 7) * 0.25).toFixed(1),
      color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size:     5 + (i % 5) * 2,
      radius:   i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
    })),
  []);

  return (
    <div className="sz-confetti-wrap" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="sz-confetti-piece"
          style={{
            left:              `${p.left}%`,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background:        p.color,
            width:             p.size,
            height:            p.size,
            borderRadius:      p.radius,
          }}
        />
      ))}
    </div>
  );
}

/* ── Daily goal card ── */
const DAILY_GOAL_COUNT = 2;

function DailyGoalCard({ pomodoroToday, goalReached, t }) {
  const pct = Math.min((pomodoroToday / DAILY_GOAL_COUNT) * 100, 100);
  return (
    <div className="sz-glass sz-dash-goal">
      <div className="sz-dash-goal-header">
        <div className="sz-dash-goal-icon">
          {goalReached ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sz-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          )}
        </div>
        <div className="sz-dash-goal-text-wrap">
          <p className="sz-dash-goal-title">{t('home.dashDailyGoal')}</p>
          <p className="sz-dash-goal-desc">
            {goalReached
              ? t('home.dashGoalCompleted')
              : t('home.dashGoalText', { count: DAILY_GOAL_COUNT })}
          </p>
        </div>
        <div className="sz-dash-goal-counter">
          <span className={`sz-dash-goal-num${goalReached ? ' done' : ''}`}>
            {pomodoroToday}
          </span>
          <span className="sz-dash-goal-total">/{DAILY_GOAL_COUNT}</span>
        </div>
      </div>
      <div className="sz-dash-goal-bar">
        <div className={`sz-dash-goal-fill${goalReached ? ' done' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Dashboard (logged-in view) ── */
function Dashboard({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isEN = i18n.language === 'en';

  const today = new Date().toISOString().split('T')[0];
  const pomodoroToday = parseInt(localStorage.getItem(`sz_pomo_${today}`) || '0', 10);
  const goalReached = pomodoroToday >= DAILY_GOAL_COUNT;

  const [profile, setProfile] = useState(null);
  const [activeBarters, setActiveBarters] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [goalCelebrated, setGoalCelebrated] = useState(
    () => localStorage.getItem(`sz_goal_${today}`) === '1'
  );

  useEffect(() => {
    setDataLoading(true);
    Promise.all([
      api.get('/api/users/profile').catch(() => null),
      api.get('/api/barters').catch(() => null),
    ]).then(([pRes, bRes]) => {
      if (pRes) setProfile(pRes.data);
      else setDataError(true);
      if (bRes) {
        const active = (bRes.data || []).filter((b) => b.status === 'active').length;
        setActiveBarters(active);
      }
    }).finally(() => setDataLoading(false));
  }, []);

  /* Confetti + gems bonus on first goal completion */
  useEffect(() => {
    if (goalReached && !goalCelebrated) {
      setGoalCelebrated(true);
      localStorage.setItem(`sz_goal_${today}`, '1');
      setShowConfetti(true);
      setProfile((prev) => prev ? { ...prev, gems: (prev.gems ?? 0) + 5 } : prev);
      const timer = setTimeout(() => setShowConfetti(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [goalReached, goalCelebrated, today]);

  const firstName = (user?.name || 'Öğrenci').split(' ')[0];
  const gems = profile?.gems ?? null;
  const courseCount = (profile?.goodAt?.length ?? 0) + (profile?.wantToLearn?.length ?? 0);
  const exp = expertiseLevel(courseCount, t);

  return (
    <div className="sz-page sz-dash">
      {showConfetti && <Confetti />}

      {/* ── Welcome header ── */}
      <div className="sz-dash-header">
        <div className="sz-dash-header-text">
          <p className="sz-dash-greeting">{t('home.dashGreeting')}</p>
          <h2 className="sz-dash-name">{firstName} 👋</h2>
          <p className="sz-dash-question">{t('home.dashQuestion')}</p>
        </div>
        <div className="sz-dash-avatar" aria-hidden="true">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* ── API error banner (only if profile failed & not still loading) ── */}
      {dataError && !dataLoading && (
        <div className="sz-alert sz-alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span style={{ flexShrink: 0 }}>⚠</span>
          <span style={{ fontSize: '0.83rem', flex: 1 }}>
            Profil verisi yüklenemedi. Bazı bilgiler eksik görünebilir.
          </span>
        </div>
      )}

      {/* ── Metric widgets ── */}
      <div className="sz-dash-metrics">
        <div className="sz-glass sz-dash-metric">
          <div className="sz-dash-metric-icon" style={{ background: 'rgba(246,194,35,0.13)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l4 6-10 13L2 9z"/>
              <line x1="2" y1="9" x2="22" y2="9"/>
            </svg>
          </div>
          {dataLoading
            ? <div className="sz-skeleton" style={{ width: 40, height: 32, borderRadius: 6, margin: '4px 0' }} />
            : <div className="sz-dash-metric-val" style={{ color: '#B7791F' }}>{gems !== null ? gems : '—'}</div>}
          <div className="sz-dash-metric-lbl">{t('home.dashGems')}</div>
        </div>

        <div className="sz-glass sz-dash-metric">
          <div className="sz-dash-metric-icon" style={{ background: 'rgba(var(--sz-secondary-rgb),0.18)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sz-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </div>
          {dataLoading
            ? <div className="sz-skeleton" style={{ width: 40, height: 32, borderRadius: 6, margin: '4px 0' }} />
            : <div className="sz-dash-metric-val">{activeBarters !== null ? activeBarters : '—'}</div>}
          <div className="sz-dash-metric-lbl">{t('home.dashActiveBarters')}</div>
        </div>
      </div>

      {/* ── Daily goal ── */}
      <DailyGoalCard pomodoroToday={pomodoroToday} goalReached={goalReached} t={t} />

      {/* ── Quick tools ── */}
      <p className="sz-dash-section-title" style={{ marginTop: '1.5rem' }}>{t('home.dashQuickTools')}</p>
      <div className="sz-dash-tools">
        <Link to="/pomodoro" className="sz-dash-tool">
          <div className="sz-dash-tool-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--sz-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="sz-dash-tool-name">{t('home.dashPomodoro')}</div>
          <div className="sz-dash-tool-desc">{t('home.dashPomodoroDesc')}</div>
          <div className="sz-dash-tool-arrow">→</div>
        </Link>

        <Link to="/locations" className="sz-dash-tool">
          <div className="sz-dash-tool-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--sz-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="sz-dash-tool-name">{t('home.dashSpots')}</div>
          <div className="sz-dash-tool-desc">{t('home.dashSpotsDesc')}</div>
          <div className="sz-dash-tool-arrow">→</div>
        </Link>
      </div>

      {/* ── Expertise progress ── */}
      <p className="sz-dash-section-title">{t('home.expertiseTitle')}</p>
      <div className="sz-card" style={{ cursor: 'pointer', marginBottom: '1rem' }} onClick={() => navigate('/profile')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sz-muted)', fontWeight: 600 }}>
            {t('home.expertiseSubtitle')}
          </p>
          <span style={{ background: exp.bg, color: exp.color, fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.7rem', borderRadius: '50px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            {exp.label}
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--sz-border)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{ height: '100%', width: `${exp.pct}%`, background: exp.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--sz-muted)', fontWeight: 600 }}>
            {courseCount > 0 ? `${courseCount} ders` : t('home.noCoursesHint')}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--sz-primary)', fontWeight: 700 }}>
            {isEN ? 'View Profile →' : 'Profili Gör →'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature cards shown on the logged-out hero screen ── */
const FEATURES = [
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
    key: 'feat1', iconBg: 'rgba(var(--sz-primary-rgb),0.08)',   iconColor: 'var(--sz-primary)',
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    key: 'feat2', iconBg: 'rgba(var(--sz-secondary-rgb),0.3)', iconColor: 'var(--sz-accent)',
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    key: 'feat3', iconBg: 'rgba(72,187,120,0.12)', iconColor: '#276749', /* success-green — no theme token */
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    key: 'feat4', iconBg: 'rgba(246,194,35,0.15)', iconColor: '#B7791F', /* gold/amber — no theme token */
  },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isEN = i18n.language === 'en';

  if (user) return <Dashboard user={user} />;

  /* ── Logged-out hero ── */
  return (
    <div className="sz-page" style={{ paddingTop: 0 }}>
      <div className="sz-hero">
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

        <h1 className="sz-hero-title">
          {isEN ? (
            <>Study Together,<br /><span>Succeed Together</span></>
          ) : (
            <>Birlikte Öğren,<br /><span>Birlikte Başar</span></>
          )}
        </h1>

        <p style={{
          fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--sz-muted)', textTransform: 'uppercase', marginBottom: '1rem',
          position: 'relative', zIndex: 1,
        }}>
          {t('home.motto')}
        </p>

        <p className="sz-hero-sub">{t('home.sub')}</p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
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
        </div>

        <div className="sz-feature-grid" style={{ marginTop: '1.75rem' }}>
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

      <div style={{
        textAlign: 'center', padding: '1.25rem',
        borderTop: '1px solid var(--sz-border)', marginTop: '1.5rem',
        color: 'var(--sz-muted)', fontSize: '0.68rem',
        letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase',
      }}>
        No Money · No Credits · Pure Peer Learning
      </div>
    </div>
  );
}
