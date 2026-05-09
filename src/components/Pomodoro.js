import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/* BR-24: Fixed 25/5 — these values are intentionally not user-configurable */
const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;
const CIRCLE_R = 90;
const CIRCLE_CIRC = 2 * Math.PI * CIRCLE_R;

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function Pomodoro() {
  const { t } = useTranslation();

  const [isWork, setIsWork] = useState(true);
  const [seconds, setSeconds] = useState(WORK_SECS);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [flash, setFlash] = useState('');
  const intervalRef = useRef(null);

  const total = isWork ? WORK_SECS : BREAK_SECS;
  const progress = (total - seconds) / total;
  const dashOffset = CIRCLE_CIRC * (1 - progress);

  const switchMode = useCallback(() => {
    if (isWork) {
      setSessions((n) => n + 1);
      setFlash(t('pomodoro.complete'));
      /* Save daily progress for Dashboard goal tracking */
      const key = `sz_pomo_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(key, String((parseInt(localStorage.getItem(key) || '0', 10) + 1)));
    } else {
      setFlash(t('pomodoro.breakComplete'));
    }
    setIsWork((p) => !p);
    setSeconds(isWork ? BREAK_SECS : WORK_SECS);
    setRunning(false);
    setTimeout(() => setFlash(''), 4000);
  }, [isWork, t]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { switchMode(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, switchMode]);

  const handleReset = () => {
    setRunning(false);
    setSeconds(isWork ? WORK_SECS : BREAK_SECS);
  };

  const strokeColor = isWork ? 'var(--sz-primary)' : 'var(--sz-accent)';

  return (
    <div className="sz-page-narrow sz-pomo-wrap">
      <h1 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>{t('pomodoro.title')}</h1>

      {/* Mode indicator */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <span className={`sz-pill${isWork ? ' sz-pill-active' : ' sz-pill-learn'}`}>
          {isWork ? t('pomodoro.work') : t('pomodoro.break')}
        </span>
      </div>

      {/* Flash message */}
      {flash && (
        <div className="sz-alert sz-alert-success" style={{ textAlign: 'center', marginBottom: '0' }}>
          {flash}
        </div>
      )}

      {/* Circle timer */}
      <div className="sz-pomo-circle">
        <svg width="220" height="220" viewBox="0 0 220 220">
          {/* Track */}
          <circle cx="110" cy="110" r={CIRCLE_R} fill="none" stroke="var(--sz-border)" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="110" cy="110" r={CIRCLE_R}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="sz-pomo-inner">
          <div className="sz-pomo-time" style={{ color: strokeColor }}>{formatTime(seconds)}</div>
          <div className="sz-pomo-mode">{isWork ? t('pomodoro.workLabel') : t('pomodoro.breakLabel')}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="sz-pomo-controls">
        <button className="btn-sz-ghost" onClick={handleReset}>{t('pomodoro.reset')}</button>
        <button
          className="btn-sz-primary"
          style={{ padding: '0.55rem 2.2rem', fontSize: '1rem' }}
          onClick={() => setRunning((p) => !p)}
        >
          {running ? t('pomodoro.pause') : t('pomodoro.start')}
        </button>
      </div>

      {/* Session dots */}
      {sessions > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sz-muted)', marginBottom: '0.6rem' }}>
            {t('pomodoro.totalSessions')}: {sessions}
          </div>
          <div className="sz-pomo-sessions">
            {Array.from({ length: Math.min(sessions, 12) }).map((_, i) => (
              <div key={i} className="sz-pomo-dot done" />
            ))}
          </div>
        </div>
      )}

      {/* Rule note */}
      <p style={{ textAlign: 'center', color: 'var(--sz-muted)', fontSize: '0.78rem', marginTop: '2.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>
        25 MIN WORK · 5 MIN BREAK
      </p>
    </div>
  );
}
