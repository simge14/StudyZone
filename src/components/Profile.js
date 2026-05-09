import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useCourses } from '../hooks/useCourses';
import { INTEREST_AREAS } from '../data/courses';
import Toast from './Toast';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function safe(val, fallback = '') {
  return val ?? fallback;
}

/* Badges only (no label — label provided by caller with icon) */
function TagList({ items, accent }) {
  if (!items?.length) return <p style={{ margin: '0.2rem 0 0', color: 'var(--sz-muted)', fontSize: '0.83rem' }}>—</p>;
  return (
    <div className="sz-badge-wrap">
      {items.map((item) => (
        <span key={item} className={`sz-badge${accent ? '' : ' sz-badge-muted'}`}
          style={accent ? {} : { background: 'rgba(var(--sz-primary-rgb),0.07)', color: 'var(--sz-muted)' }}>
          {item}
        </span>
      ))}
    </div>
  );
}

/* eslint-disable-next-line no-unused-vars */
function _TagRowUnused({ label, items, accent }) { return null; }

/* ─────────────────────────────────────────
   Course picker (edit) — fetches /api/courses
───────────────────────────────────────── */
function CoursePicker({ label, selected, onChange }) {
  const { t }                   = useTranslation();
  const { courses, loading }    = useCourses();
  const [search, setSearch]     = useState('');

  const safe  = Array.isArray(courses) ? courses : [];
  const items = loading ? [] : safe.filter(
    (c) => typeof c === 'string' && c.toLowerCase().includes(search.toLowerCase())
  );
  const toggle = (c) =>
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);

  return (
    <div className="sz-form-group">
      <label className="sz-label">{label}</label>
      <div className="sz-course-picker">
        <input className="sz-course-search"
          placeholder={loading ? "SQL'den yükleniyor…" : t('register.searchCourses')}
          value={search} onChange={(e) => setSearch(e.target.value)}
          disabled={loading} />
        <div className="sz-course-list">
          {loading
            ? [40, 60, 50].map((w, i) => (
                <div key={i} style={{ padding: '0.55rem 0.9rem', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <div className="sz-skeleton" style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0 }} />
                  <div className="sz-skeleton" style={{ height: 13, width: `${w}%`, borderRadius: 4 }} />
                </div>
              ))
            : items.map((c) => (
                <label key={c} className="sz-course-item">
                  <input type="checkbox" checked={selected.includes(c)} onChange={() => toggle(c)} />
                  {c}
                </label>
              ))}
        </div>
      </div>
      <div className="sz-badge-wrap" style={{ marginTop: '0.4rem' }}>
        {selected.map((c) => (
          <span key={c} className="sz-badge">
            {c} <span className="sz-badge-remove" onClick={() => toggle(c)}>✕</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Error detail box — shows real backend msg
───────────────────────────────────────── */
function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="sz-alert sz-alert-danger" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, fontWeight: 700 }}>✕</span>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Hata</strong>
        <span style={{ fontSize: '0.85rem' }}>{error}</span>
      </div>
      {onRetry && (
        <button className="btn-sz-ghost"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem', minHeight: 28, flexShrink: 0 }}
          onClick={onRetry}>
          ↺
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Logout confirmation dialog
───────────────────────────────────────── */
function LogoutDialog({ onConfirm, onCancel, loading }) {
  const { t } = useTranslation();
  return (
    <div className="sz-otp-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
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
          <button
            className="btn-sz-primary btn-full"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: 'var(--sz-primary)',
              boxShadow: '0 4px 16px rgba(var(--sz-primary-rgb), 0.35)',
            }}
          >
            {loading ? '...' : t('auth.logoutConfirm')}
          </button>
          <button className="btn-sz-ghost btn-full" onClick={onCancel}>
            {t('auth.logoutCancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Delete modal — BR-38
───────────────────────────────────────── */
function DeleteModal({ onConfirm, onCancel, loading }) {
  const { t } = useTranslation();
  return (
    <div className="sz-otp-backdrop">
      <div className="sz-otp-box" style={{ maxWidth: 420 }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>⚠</div>
        <h3 style={{ color: '#E53E3E', marginBottom: '0.85rem' }}>{t('profile.deleteAccount')}</h3>
        <div className="sz-alert sz-alert-danger" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          {t('profile.deleteWarning')}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-sz-danger" onClick={onConfirm} disabled={loading}>
            {loading ? t('common.loading') : t('profile.deleteConfirm')}
          </button>
          <button className="btn-sz-ghost" onClick={onCancel}>{t('profile.deleteCancel')}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Learnership card — BR-17 / BR-19 / BR-23
───────────────────────────────────────── */
function LearnershipCard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStatus = useCallback(() => {
    setLoading(true);
    api.get('/api/learnership')
      .then(({ data: d }) => { setData(d); setError(''); })
      .catch((err) => setError(err.response?.data?.message || 'Learnership durumu alınamadı.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  if (loading) return (
    <div className="sz-card" style={{ marginTop: '1rem' }}>
      {[60, 80, 50].map((w, i) => (
        <div key={i} className="sz-skeleton"
          style={{ height: i === 0 ? 16 : 12, width: `${w}%`, marginBottom: 10, borderRadius: 4 }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="sz-card" style={{ marginTop: '1rem' }}>
      <ErrorBox error={error} onRetry={fetchStatus} />
    </div>
  );

  if (!data?.applied) return null;

  return (
    <div className="sz-card" style={{ marginTop: '1rem', borderLeft: '3px solid var(--sz-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.2rem' }}>🤝</span>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Study Buddy Durumu</h3>
        <span style={{ marginLeft: 'auto' }}
          className={`sz-pill ${data.matched ? 'sz-pill-active' : 'sz-pill-learn'}`}>
          {data.matched ? '● Eşleşildi' : '○ Bekleniyor'}
        </span>
      </div>

      {data.matched ? (
        /* BR-19: max 1 active • BR-23: show contact */
        <div>
          <div style={{ background: 'rgba(108,92,231,0.06)', borderRadius: 'var(--sz-radius)', padding: '1rem', marginBottom: '0.85rem' }}>
            <div style={{ marginBottom: '0.6rem' }}>
              <span className="sz-label">Çalışma Arkadaşı</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>{safe(data.partnerName, '—')}</p>
            </div>
            {data.partnerEmail && (
              <div style={{ marginBottom: '0.6rem' }}>
                <span className="sz-label">İletişim — BR-23</span>
                <p style={{ margin: '0.2rem 0 0', fontFamily: 'monospace', fontSize: '0.85rem',
                  color: 'var(--sz-accent)' }}>
                  {data.partnerEmail}
                </p>
              </div>
            )}
            {data.subject && (
              <div>
                <span className="sz-label">Çalışma Konusu</span>
                <p style={{ margin: '0.2rem 0 0' }}>{data.subject}</p>
              </div>
            )}
          </div>
          <div className="sz-alert sz-alert-success" style={{ marginBottom: 0, fontSize: '0.82rem' }}>
            ✓ Aktif bir çalışma arkadaşınız var. BR-19 gereği yeni eşleşme yapılmaz.
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <span className="sz-label">Tercih Konusu</span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>{safe(data.subject, '—')}</p>
            </div>
            {data.locationPreference && (
              <div style={{ flex: 1, minWidth: 120 }}>
                <span className="sz-label">Buluşma</span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>{data.locationPreference}</p>
              </div>
            )}
          </div>
          {/* Waiting animation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.75rem 1rem', borderRadius: 'var(--sz-radius)',
            background: 'rgba(29,78,216,0.06)', border: '1px solid var(--sz-border)' }}>
            <span style={{ fontSize: '1.1rem', animation: 'spin 2s linear infinite',
              display: 'inline-block' }}>⏳</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--sz-accent)' }}>
                Eşleşme Bekleniyor
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sz-muted)' }}>
                Sistem sizi uygun bir arkadaşla eşleştirecek.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════
   Main Profile component
═════════════════════════════════════════ */
export default function Profile() {
  const { t }              = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const navigate           = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [editing,    setEditing]    = useState(false);
  const [editForm,   setEditForm]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [saveError,  setSaveError]  = useState('');
  const [toast,      setToast]      = useState(null);   /* { type, message } */
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* ── Fetch profile with graceful null fallback ── */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/users/profile');
      setProfile(data);
    } catch (err) {
      const msg = err.response?.data?.message || t('common.error');
      setError(msg);
      /* Null-safe fallback using auth context */
      if (user && !profile) {
        setProfile({
          id:          user?.id          ?? null,
          name:        user?.name        ?? '',
          email:       user?.email       ?? '',
          bio:         user?.bio         ?? '',
          interests:   user?.interests   ?? [],
          goodAt:      user?.goodAt      ?? [],
          wantToLearn: user?.wantToLearn ?? [],
          totalBarters: 0,
          avgRating:   null,
          learnership: false,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [t, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── startEdit — fully null-safe with optional chaining ── */
  const startEdit = () => {
    setSaveError('');
    setEditForm({
      name:        safe(profile?.name),
      bio:         safe(profile?.bio),
      interests:   profile?.interests   ?? [],
      goodAt:      profile?.goodAt      ?? [],
      wantToLearn: profile?.wantToLearn ?? [],
      learnership: profile?.learnership ? 'yes' : 'no',
    });
    setEditing(true);
  };

  /* ── Save ──────────────────────────────────────────────────
     Sends BOTH naming conventions so backend accepts either.
     Arrays are converted to comma-separated strings (SQL format)
     AND kept as arrays (REST format) in the same payload.
     BR-17: LearnershipStatus=1 auto-enrolls in matching pool.
  ──────────────────────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    const isYes = editForm.learnership === 'yes';

    const payload = {
      /* ── REST / camelCase ── */
      name:        editForm.name?.trim() ?? '',
      bio:         editForm.bio  ?? '',
      interests:   editForm.interests   ?? [],
      goodAt:      editForm.goodAt      ?? [],
      wantToLearn: editForm.wantToLearn ?? [],
      learnership: isYes,

      /* ── SQL-style field names (comma-separated strings) ── */
      UserEmail:        profile?.email ?? '',
      Interests:        (editForm.interests   ?? []).join(','),
      GoodCourses:      (editForm.goodAt      ?? []).join(','),
      TargetCourses:    (editForm.wantToLearn ?? []).join(','),
      LearnershipStatus: isYes ? 1 : 0,
    };

    try {
      /* Primary endpoint */
      const { data } = await api.put('/api/user/update', payload);
      setProfile(data);
      updateUser({ ...user, name: data?.name ?? user?.name });
      setEditing(false);
      /* Success Toast */
      setToast({ type: 'success', message: '✓ Profil Başarıyla Güncellendi!' });
      /* BR-17 feedback */
      if (isYes && data?.learnership) {
        setTimeout(() => setToast({ type: 'success', message: '🤝 Learnership havuzuna katıldınız (BR-17)!' }), 2000);
      }
    } catch (err) {
      /* Show the real backend error message */
      const msg = err.response?.data?.message || `Kaydedilemedi: ${err.message}`;
      setSaveError(msg);
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('/api/users/account');
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Logout — clears all auth storage, navigates to landing ── */
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      /* Best-effort backend logout (ignore errors) */
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      /* AuthContext.logout() wipes localStorage + sessionStorage */
      logout();
      setShowLogout(false);
      setLoggingOut(false);
      /* Navigate to landing page — "Birlikte Öğren, Birlikte Başar" */
      navigate('/', { replace: true });
    }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="sz-page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {[1,2,3].map((n) => (
          <div key={n} className="sz-skeleton" style={{ height: 72, borderRadius: 8 }} />
        ))}
      </div>
      {[1,2].map((n) => (
        <div key={n} className="sz-skeleton" style={{ height: n === 1 ? 200 : 100, borderRadius: 8, marginBottom: 12 }} />
      ))}
    </div>
  );

  return (
    <>
      {showDelete && (
        <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleting} />
      )}

      {showLogout && (
        <LogoutDialog onConfirm={handleLogout} onCancel={() => setShowLogout(false)} loading={loggingOut} />
      )}

      {/* Global Toast — slides above bottom nav */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="sz-page">
        {error && <ErrorBox error={error} onRetry={fetchProfile} />}

        {!editing ? (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.7rem', marginBottom: '1.1rem' }}>
              <div className="sz-stat-box">
                <div className="sz-stat-num">{profile?.totalBarters ?? 0}</div>
                <div className="sz-stat-label">{t('profile.totalBarters')}</div>
              </div>
              <div className="sz-stat-box">
                <div className="sz-stat-num" style={{ fontSize: '0.9rem' }}>
                  {profile?.gems ?? 0} 💎
                </div>
                <div className="sz-stat-label">Gems</div>
              </div>
              <div className="sz-stat-box">
                <div className="sz-stat-num"
                  style={{ fontSize: '1rem', color: profile?.learnership ? 'var(--sz-primary)' : 'var(--sz-muted)' }}>
                  {profile?.learnership ? '✓' : '—'}
                </div>
                <div className="sz-stat-label">{t('profile.learnership')}</div>
              </div>
            </div>

            {/* Profile card */}
            <div className="sz-card">
              {/* Header with avatar ring */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Avatar ring */}
                  <div className="sz-avatar-ring">
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--sz-primary), #5C3FE8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.03em',
                    }}>
                      {(profile?.name || '?').trim().split(/\s+/).slice(0,2).map((w) => w[0]?.toUpperCase() ?? '').join('')}
                    </div>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                      {safe(profile?.name, '—')}
                    </h2>
                    {/* Verified badge */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem',
                      background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.25)',
                      borderRadius: '50px', padding: '0.12rem 0.55rem',
                      fontSize: '0.65rem', fontWeight: 700, color: '#276749', letterSpacing: '0.03em',
                    }}>
                      <span style={{ fontSize: '0.7rem' }}>✓</span>
                      {t('profile.verifiedBadge')}
                    </div>
                  </div>
                </div>
                <button className="btn-sz-secondary"
                  style={{ padding: '0.38rem 0.85rem', fontSize: '0.78rem' }}
                  onClick={startEdit}>
                  {t('profile.editBtn')}
                </button>
              </div>

              {/* Email field */}
              <div style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--sz-muted)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.84rem', color: 'var(--sz-muted)' }}>
                  {safe(profile?.email, '—')}
                </span>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <div style={{ marginBottom: '0.85rem', padding: '0.65rem 0.85rem', background: 'var(--sz-bg)', borderRadius: 'var(--sz-radius-sm)', border: '1px solid var(--sz-border)' }}>
                  <p style={{ margin: 0, color: 'var(--sz-muted)', fontSize: '0.85rem', lineHeight: 1.55, fontStyle: 'italic' }}>
                    "{profile.bio}"
                  </p>
                </div>
              )}

              <hr className="sz-divider" />

              {/* Profile fields with icons */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sz-muted)" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="sz-label" style={{ margin: 0 }}>{t('profile.interests')}</span>
                </div>
                <TagList items={profile?.interests} />
              </div>
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sz-primary)" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span className="sz-label" style={{ margin: 0 }}>{t('profile.goodAt')}</span>
                </div>
                <TagList items={profile?.goodAt} accent />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C3FE8" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="sz-label" style={{ margin: 0 }}>{t('profile.wantToLearn')}</span>
                </div>
                <TagList items={profile?.wantToLearn} accent />
              </div>

              <hr className="sz-divider" />
              <div style={{ textAlign: 'right' }}>
                <button className="btn-sz-danger"
                  style={{ fontSize: '0.78rem', padding: '0.38rem 0.9rem' }}
                  onClick={() => setShowDelete(true)}>
                  {t('profile.deleteAccount')}
                </button>
              </div>
            </div>

            {/* Study Buddy card — only when learnership opted-in */}
            {profile?.learnership && <LearnershipCard />}

            {/* ── Logout button — bottom of profile ── */}
            <div style={{ marginTop: '1.25rem' }}>
              <button
                onClick={() => setShowLogout(true)}
                style={{
                  width: '100%',
                  minHeight: 48,
                  background: 'transparent',
                  border: '1.5px solid var(--sz-primary)',
                  borderRadius: '50px',
                  color: 'var(--sz-primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--sz-primary-rgb), 0.06)';
                  e.currentTarget.style.transform  = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform  = 'none';
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={(e)   => { e.currentTarget.style.transform = 'none'; }}
              >
                {/* Logout icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {t('auth.logoutBtn')}
              </button>
            </div>
          </>
        ) : (
          /* ── Edit form ── */
          <div className="sz-card">
            <div className="sz-section-header">
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{t('profile.editTitle')}</h2>
              <button className="btn-sz-ghost"
                style={{ padding: '0.38rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => { setEditing(false); setSaveError(''); }}>
                {t('profile.cancelBtn')}
              </button>
            </div>

            {/* Real error from backend shown here */}
            {saveError && <ErrorBox error={saveError} />}

            <form onSubmit={handleSave}>
              {/* Name */}
              <div className="sz-form-group">
                <label className="sz-label">{t('profile.name')}</label>
                <input className="sz-input" value={editForm.name || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              </div>

              {/* Bio */}
              <div className="sz-form-group">
                <label className="sz-label">Bio</label>
                <textarea className="sz-input" rows={2} style={{ resize: 'vertical' }}
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} />
              </div>

              {/* Interests */}
              <div className="sz-form-group">
                <label className="sz-label">{t('profile.interests')}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {INTEREST_AREAS.map((area) => {
                    const sel = editForm.interests?.includes(area);
                    return (
                      <button key={area} type="button"
                        onClick={() => setEditForm((p) => ({
                          ...p,
                          interests: sel
                            ? (p.interests || []).filter((x) => x !== area)
                            : [...(p.interests || []), area],
                        }))}
                        style={{
                          padding: '0.25rem 0.7rem', borderRadius: '50px', border: '1.5px solid',
                          borderColor:  sel ? 'var(--sz-primary)' : 'var(--sz-border)',
                          background:   sel ? 'var(--sz-primary)' : 'transparent',
                          color:        sel ? '#fff' : 'var(--sz-muted)',
                          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', minHeight: 34,
                        }}>
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Good At — BR-06: from /api/courses */}
              <CoursePicker
                label={t('profile.goodAt')}
                selected={editForm.goodAt || []}
                onChange={(v) => setEditForm((p) => ({ ...p, goodAt: v }))} />

              {/* Want to Learn — BR-06 */}
              <CoursePicker
                label={t('profile.wantToLearn')}
                selected={editForm.wantToLearn || []}
                onChange={(v) => setEditForm((p) => ({ ...p, wantToLearn: v }))} />

              {/* Learnership */}
              <div className="sz-form-group">
                <label className="sz-label">{t('profile.learnership')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['yes', 'no'].map((v) => (
                    <label key={v}
                      onClick={() => setEditForm((p) => ({ ...p, learnership: v }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', padding: '0.55rem 1rem',
                        borderRadius: 'var(--sz-radius)', border: '1.5px solid',
                        borderColor:  editForm.learnership === v ? 'var(--sz-primary)' : 'var(--sz-border)',
                        background:   editForm.learnership === v ? 'rgba(108,92,231,0.07)' : 'transparent',
                        color:        editForm.learnership === v ? 'var(--sz-primary)' : 'var(--sz-muted)',
                        fontWeight: 600, fontSize: '0.88rem', minHeight: 44,
                      }}>
                      <input type="radio" name="edit-learn" value={v}
                        checked={editForm.learnership === v} onChange={() => {}}
                        style={{ accentColor: 'var(--sz-primary)', width: 17, height: 17 }} />
                      {v === 'yes' ? t('register.learnYes') : t('register.learnNo')}
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn-sz-primary btn-full" type="submit" disabled={saving}>
                {saving ? t('common.loading') : t('profile.saveBtn')}
              </button>
            </form>
          </div>
        )}
      </div>

    </>
  );
}
