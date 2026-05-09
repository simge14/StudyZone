import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ── Avatar with initials ── */
function Avatar({ name, size = 56 }) {
  const initials = (name || '??')
    .trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '').join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--sz-primary), var(--sz-secondary))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: size * 0.32,
      flexShrink: 0, letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  );
}

/* ── Animated search rings ── */
function SearchAnimation({ title, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' }}>
      {/* Concentric rings */}
      <div style={{ position: 'relative', width: 88, height: 88, marginBottom: '1.5rem' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid var(--sz-primary)', opacity: 0,
            animation: `sz-ping 2s ease-out ${i * 0.65}s infinite`,
          }} />
        ))}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--sz-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(var(--sz-primary-rgb),0.35)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
      </div>

      {/* Bounce dots */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.1rem' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--sz-primary)',
            animation: `sz-bounce 1.3s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <p style={{ fontWeight: 800, fontSize: '0.97rem', color: 'var(--sz-text)', margin: '0 0 0.45rem', textAlign: 'center', lineHeight: 1.4 }}>
        {title}
      </p>
      <p style={{ color: 'var(--sz-muted)', fontSize: '0.82rem', textAlign: 'center', margin: 0, lineHeight: 1.55 }}>
        {desc}
      </p>
    </div>
  );
}

/* ── BR-19 capacity pill ── */
function BR19Pill({ matched }) {
  const { t } = useTranslation();
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: matched ? 'rgba(229,62,62,0.08)' : 'rgba(var(--sz-primary-rgb),0.07)',
      border: `1px solid ${matched ? 'rgba(229,62,62,0.2)' : 'rgba(var(--sz-primary-rgb),0.15)'}`,
      borderRadius: '50px', padding: '0.22rem 0.8rem',
      fontSize: '0.7rem', fontWeight: 700,
      color: matched ? '#C53030' : 'var(--sz-primary)',
      letterSpacing: '0.03em',
    }}>
      <span style={{ fontFamily: 'monospace', fontWeight: 900 }}>{matched ? '1/1' : '0/1'}</span>
      {t('learnership.capacityTitle').replace(' — BR-19', '')} — BR-19
    </div>
  );
}

/* ── Motivational card (not applied state) ── */
function MotivationalCard({ onActivate }) {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
      {/* Illustration placeholder */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%', margin: '0 auto 1.5rem',
        background: 'linear-gradient(135deg, rgba(10,0,117,0.08), rgba(196,179,245,0.2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Outer ring */}
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px dashed rgba(var(--sz-primary-rgb),0.2)' }} />
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
          stroke="var(--sz-primary)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.6rem', letterSpacing: '-0.03em' }}>
        {t('learnership.notAppliedTitle')}
      </h2>
      <p style={{ color: 'var(--sz-muted)', fontSize: '0.87rem', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: 280, margin: '0 auto 1.5rem' }}>
        {t('learnership.notAppliedDesc')}
      </p>

      <button className="btn-sz-primary" onClick={onActivate} style={{ marginBottom: '0.75rem' }}>
        {t('learnership.activateBtn')}
      </button>

      {/* Motivational section */}
      <div className="sz-card sz-glass" style={{ marginTop: '1.25rem', textAlign: 'left' }}>
        <p style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '0.9rem' }}>
          ✨ {t('learnership.motivationalTitle')}
        </p>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: 'var(--sz-muted)', lineHeight: 1.55 }}>
          {t('learnership.motivationalDesc')}
        </p>
        <button className="btn-sz-secondary" onClick={onActivate} style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
          {t('learnership.motivationalCta')} →
        </button>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--sz-muted)', fontWeight: 600 }}>
        {t('learnership.br19note')}
      </p>
    </div>
  );
}

/* ── Partner card (matched state) ── */
function PartnerCard({ data }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    if (!data.partnerEmail) return;
    navigator.clipboard?.writeText(data.partnerEmail).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ background: 'var(--sz-card)', border: '1px solid var(--sz-border)', borderRadius: 'var(--sz-radius)', overflow: 'hidden', marginBottom: '1rem', boxShadow: 'var(--sz-shadow-md)' }}>
      {/* Gradient header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--sz-primary) 0%, var(--sz-accent) 100%)',
        padding: '1.25rem 1.25rem 2.5rem', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Avatar name={data.partnerName} size={54} />
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#fff' }}>
              {data.partnerName ?? '—'}
            </p>
            {data.subject && (
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
                📚 {data.subject}
              </p>
            )}
          </div>
        </div>
        <div style={{
          position: 'absolute', top: '0.9rem', right: '1rem',
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
          borderRadius: '50px', padding: '0.18rem 0.7rem',
          fontSize: '0.68rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
        }}>
          {t('learnership.matchedBadge')}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1rem 1.25rem', marginTop: '-1rem' }}>
        {/* Contact info — BR-23 */}
        <div style={{
          background: 'var(--sz-bg)',
          border: '1px solid var(--sz-border)',
          borderRadius: 'var(--sz-radius-sm)',
          padding: '0.85rem 1rem',
          marginBottom: '0.85rem',
        }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
            {t('learnership.contactLabel')}
          </p>
          {data.partnerEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--sz-primary)', wordBreak: 'break-all' }}>
                {data.partnerEmail}
              </span>
              <button onClick={copyEmail} style={{
                background: copied ? 'rgba(72,187,120,0.12)' : 'rgba(var(--sz-primary-rgb),0.07)',
                border: 'none', borderRadius: '50px',
                padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
                cursor: 'pointer', color: copied ? '#276749' : 'var(--sz-primary)',
                flexShrink: 0, transition: 'all 0.15s ease', minHeight: 30,
              }}>
                {copied ? t('learnership.copied') : t('learnership.copy')}
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--sz-muted)', fontSize: '0.85rem' }}>—</p>
          )}
        </div>

        {/* Location + subject details */}
        {(data.locationPreference || data.subject) && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            {data.subject && (
              <div style={{ flex: 1, minWidth: 100 }}>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
                  {t('learnership.subjectLabel')}
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.87rem' }}>{data.subject}</p>
              </div>
            )}
            {data.locationPreference && (
              <div style={{ flex: 1, minWidth: 100 }}>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
                  {t('learnership.meetingLabel')}
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.87rem' }}>{data.locationPreference}</p>
              </div>
            )}
          </div>
        )}

        {/* BR-19 */}
        <BR19Pill matched />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Main Learnership page
════════════════════════════════════════ */
export default function Learnership() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStatus = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/api/learnership')
      .then(({ data: d }) => setData(d))
      .catch((err) => setError(err.response?.data?.message || t('learnership.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (user) fetchStatus();
    else setLoading(false);
  }, [user, fetchStatus]);

  /* ── Skeleton ── */
  if (loading) return (
    <div className="sz-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="sz-skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
        <div>
          <div className="sz-skeleton" style={{ width: 140, height: 16, borderRadius: 4, marginBottom: 6 }} />
          <div className="sz-skeleton" style={{ width: 95,  height: 12, borderRadius: 4 }} />
        </div>
      </div>
      <div className="sz-skeleton" style={{ height: 200, borderRadius: 'var(--sz-radius)', marginBottom: 12 }} />
      <div className="sz-skeleton" style={{ height: 90,  borderRadius: 'var(--sz-radius)' }} />
    </div>
  );

  /* ── Not logged in ── */
  if (!user) return (
    <div className="sz-page" style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <p style={{ color: 'var(--sz-muted)', marginBottom: '1.25rem' }}>
        {t('learnership.loginRequired')}
      </p>
      <button className="btn-sz-primary" onClick={() => navigate('/login')}>
        {t('learnership.loginBtn')}
      </button>
    </div>
  );

  return (
    <>
      {/* Keyframes (injected once) */}
      <style>{`
        @keyframes sz-ping {
          0%   { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes sz-bounce {
          0%, 100% { transform: translateY(0);    opacity: 0.45; }
          50%       { transform: translateY(-7px); opacity: 1;   }
        }
      `}</style>

      <div className="sz-page">
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--sz-primary), var(--sz-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(var(--sz-primary-rgb),0.3)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
              {t('learnership.pageTitle')}
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sz-muted)' }}>
              {t('learnership.pageSubtitle')}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="sz-alert sz-alert-danger">
            {error}
            <button className="btn-sz-ghost"
              style={{ marginLeft: '0.75rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', minHeight: 28 }}
              onClick={fetchStatus}>
              ↺ {t('learnership.retry')}
            </button>
          </div>
        )}

        {/* ── State machine ── */}
        {!data?.applied ? (
          <MotivationalCard onActivate={() => navigate('/profile')} />
        ) : data.matched ? (
          <>
            <PartnerCard data={data} />
            <div className="sz-card" style={{ borderLeft: '3px solid #E53E3E' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--sz-muted)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--sz-text)' }}>BR-19:</strong>{' '}
                {t('learnership.br19Active')}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Waiting */}
            <div className="sz-card" style={{ marginBottom: '0.85rem' }}>
              <SearchAnimation
                title={t('learnership.waitingTitle')}
                desc={t('learnership.waitingDesc')} />
            </div>

            {/* Application details */}
            {(data.subject || data.locationPreference || data.status) && (
              <div className="sz-card" style={{ marginBottom: '0.85rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
                  {t('learnership.appDetails')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {data.subject && (
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.87rem', alignItems: 'center' }}>
                      <span>📚</span>
                      <span style={{ color: 'var(--sz-muted)' }}>{t('learnership.subjectLabel')}:</span>
                      <strong>{data.subject}</strong>
                    </div>
                  )}
                  {data.locationPreference && (
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.87rem', alignItems: 'center' }}>
                      <span>📍</span>
                      <span style={{ color: 'var(--sz-muted)' }}>{t('learnership.meetingLabel')}:</span>
                      <strong>{data.locationPreference}</strong>
                    </div>
                  )}
                  {data.status && (
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.87rem', alignItems: 'center' }}>
                      <span>📋</span>
                      <span style={{ color: 'var(--sz-muted)' }}>{t('learnership.statusLabel')}:</span>
                      <strong>{data.status}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BR-19 capacity */}
            <div className="sz-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sz-muted)' }}>
                  {t('learnership.capacityTitle')}
                </p>
                <BR19Pill matched={false} />
              </div>
              <div style={{ height: 5, background: 'var(--sz-border)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.45rem' }}>
                <div style={{ height: '100%', width: '0%', background: 'var(--sz-primary)', borderRadius: 3 }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sz-muted)' }}>
                {t('learnership.br19Waiting')} {t('learnership.br19Max')}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
