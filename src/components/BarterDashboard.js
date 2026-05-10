import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useCourses } from '../hooks/useCourses';

/* BR-12: max 3 active barters */
const MAX_ACTIVE = 3;

/* ── Star rating — BR-16 ── */
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
      {[1,2,3,4,5].map((n) => (
        <span key={n} className={`sz-star${n <= (hover||value) ? ' filled' : ''}`}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>★</span>
      ))}
    </div>
  );
}

/* ── Rate modal — BR-16 ── */
function RateModal({ barter, onSubmit, onCancel, loading }) {
  const { t } = useTranslation();
  const [stars, setStars] = useState(0);
  return (
    <div className="sz-otp-backdrop">
      <div className="sz-otp-box" style={{ maxWidth: 380 }}>
        <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>⭐</div>
        <h3 style={{ marginBottom: '0.4rem' }}>{t('barter.rateTitle')}</h3>
        <p style={{ color: 'var(--sz-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {t('barter.rateDesc')} <strong>{barter.partnerName ?? barter.userName}</strong>
        </p>
        <StarRating value={stars} onChange={setStars} />
        <div style={{ display:'flex', gap:'0.6rem', justifyContent:'center', marginTop:'1.25rem', flexWrap:'wrap' }}>
          <button className="btn-sz-primary" onClick={() => onSubmit(stars)} disabled={stars===0||loading}>
            {loading ? t('common.loading') : t('barter.rateSubmit')}
          </button>
          <button className="btn-sz-ghost" onClick={onCancel}>{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

/* ── New request modal ──
   BR-07: only profile courses
   BR-08: NO price/credits/payment fields anywhere
   BR-12: submit disabled when activeCount >= 3
   BR-14: same course can't be both teach & learn
────────────────────────── */
function NewBarterModal({ profileCourses, existingActive, onSubmit, onCancel, loading, error }) {
  const { t } = useTranslation();
  const { courses: allCourses, loading: coursesLoading } = useCourses();

  const [teachCourse, setTeachCourse] = useState('');
  const [learnCourse, setLearnCourse] = useState('');
  const [desc,        setDesc]        = useState('');

  /* BR-07: restrict to profile courses (fallback to all courses if profile empty) */
  const available = profileCourses.length > 0 ? profileCourses : allCourses;

  /* Courses already in active teach/learn positions */
  const activeTeachCourses = existingActive.map((b) => b.teachCourse).filter(Boolean);
  const activeLearnCourses = existingActive.map((b) => b.learnCourse).filter(Boolean);

  const teachOptions = available.filter((c) => !activeLearnCourses.includes(c));
  const learnOptions = available.filter((c) => !activeTeachCourses.includes(c));

  /* BR-14: same course can't be offered and requested simultaneously */
  const sameError = teachCourse && learnCourse && teachCourse === learnCourse;
  const canSubmit = teachCourse && learnCourse && !sameError;

  return (
    <div className="sz-otp-backdrop">
      <div className="sz-otp-box" style={{ maxWidth: 460, textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('barter.createTitle')}</h3>

        {error    && <div className="sz-alert sz-alert-danger">{error}</div>}
        {sameError && <div className="sz-alert sz-alert-warning">{t('barter.sameCoursError')}</div>}

        {/* BR-08 notice — no money, no credits */}
        <div className="sz-alert sz-alert-success" style={{ fontSize:'0.78rem', marginBottom:'1rem' }}>
          ⇄ Sadece bilgi takası — para, puan veya kredi yok (BR-08)
        </div>

        <div className="sz-form-group">
          <label className="sz-label">{t('barter.iTeach')}</label>
          <select className="sz-input" value={teachCourse}
            onChange={(e) => setTeachCourse(e.target.value)} disabled={coursesLoading}>
            <option value="">— {t('barter.iTeach')} —</option>
            {teachOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="sz-form-group">
          <label className="sz-label">{t('barter.iLearn')}</label>
          <select className="sz-input" value={learnCourse}
            onChange={(e) => setLearnCourse(e.target.value)} disabled={coursesLoading}>
            <option value="">— {t('barter.iLearn')} —</option>
            {learnOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="sz-form-group">
          <label className="sz-label">{t('barter.description')}</label>
          <textarea className="sz-input" rows={2} style={{ resize:'vertical' }}
            placeholder={t('barter.descPlaceholder')}
            value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
          <button className="btn-sz-ghost" onClick={onCancel}>{t('barter.cancel')}</button>
          <button className="btn-sz-primary" disabled={!canSubmit||loading}
            onClick={() => onSubmit({ teachCourse, learnCourse, desc })}>
            {loading ? t('common.loading') : t('barter.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Single barter card ── */
function BarterCard({ barter, isOwn, onComplete, onRate }) {
  const { t } = useTranslation();
  const pillClass = {
    active:    'sz-pill-active',
    completed: 'sz-pill-completed',
    cancelled: 'sz-pill-cancelled',
  }[barter.status] || 'sz-pill-active';

  const statusLabel = {
    active:    t('barter.active'),
    completed: t('barter.completed'),
    cancelled: t('barter.cancelled'),
  }[barter.status] || barter.status;

  return (
    <div className="sz-barter-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem', flexWrap:'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.4rem' }}>
            {barter.teachCourse && <span className="sz-pill sz-pill-teach">▲ {barter.teachCourse}</span>}
            {barter.learnCourse && barter.learnCourse !== barter.teachCourse && (
              <>
                <span style={{ color:'var(--sz-muted)', alignSelf:'center', fontSize:'0.8rem' }}>⇄</span>
                <span className="sz-pill sz-pill-learn">▼ {barter.learnCourse}</span>
              </>
            )}
          </div>
          <span style={{ fontSize:'0.76rem', color:'var(--sz-muted)' }}>
            {t('barter.postedBy')} <strong>{barter.userName}</strong>
          </span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.35rem', flexShrink:0 }}>
          <span className={`sz-pill ${pillClass}`}>{statusLabel}</span>
          {isOwn && barter.status === 'active' && (
            <button className="btn-sz-ghost"
              style={{ fontSize:'0.75rem', padding:'0.22rem 0.6rem', minHeight:32 }}
              onClick={() => onComplete(barter)}>
              {t('barter.complete')}
            </button>
          )}
          {isOwn && barter.status === 'completed' && !barter.rated && (
            <button className="btn-sz-outline"
              style={{ fontSize:'0.75rem', padding:'0.22rem 0.6rem', minHeight:32 }}
              onClick={() => onRate(barter)}>
              ★ Rate Partner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Dashboard
══════════════════════════════════════════ */
export default function BarterDashboard() {
  const { t }    = useTranslation();
  const { user } = useAuth();

  const [tab,          setTab]          = useState('all');
  const [barters,      setBarters]      = useState([]);
  const [myBarters,    setMyBarters]    = useState([]);
  const [profileCourses, setProfileCourses] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showNew,      setShowNew]      = useState(false);
  const [newLoading,   setNewLoading]   = useState(false);
  const [newError,     setNewError]     = useState('');
  const [rateTarget,   setRateTarget]   = useState(null);
  const [rateLoading,  setRateLoading]  = useState(false);

  /* BR-12: active = status 'active' (Pending + Matched normalized by backend) */
  const activeCount = myBarters.filter((b) => b.status === 'active').length;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bartersRes, profileRes] = await Promise.all([
        api.get('/api/barters'),
        api.get('/api/users/profile').catch(() => ({ data: {} })),
      ]);

      const allBarters = Array.isArray(bartersRes.data) ? bartersRes.data : [];
      setBarters(allBarters);

      /* Match "my" barters by name since schema has no userId FK */
      const myName = (user?.name || '').trim().toLowerCase();
      const mine = allBarters.filter(
        (b) => (b.userName || '').trim().toLowerCase() === myName
      );
      setMyBarters(mine);

      const profile = profileRes.data || {};
      setProfileCourses([...(profile.goodAt || []), ...(profile.wantToLearn || [])]);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async ({ teachCourse, learnCourse, desc }) => {
    setNewError('');

    /* BR-12: frontend double-check before sending */
    if (activeCount >= MAX_ACTIVE) {
      setNewError(t('barter.maxLimitWarning'));
      return;
    }

    setNewLoading(true);
    try {
      /* Send both courses — backend stores as "teach ↔ learn" in CourseName (NVARCHAR 100) */
      await api.post('/api/barters', {
        teachCourse,
        learnCourse,
        CourseName:  teachCourse,   /* SQL column */
        description: desc,
      });
      await fetchAll();
      setShowNew(false);
    } catch (err) {
      setNewError(err.response?.data?.message || t('common.error'));
    } finally {
      setNewLoading(false);
    }
  };

  const handleComplete = async (barter) => {
    try {
      await api.patch(`/api/barters/${barter.id}/complete`);
      await fetchAll();
      setRateTarget(barter);
    } catch { setError(t('common.error')); }
  };

  const handleRate = async (stars) => {
    setRateLoading(true);
    try {
      await api.post('/api/ratings', { barterId: rateTarget.id, stars });
      await fetchAll();
      setRateTarget(null);
    } catch { setError(t('common.error')); }
    finally { setRateLoading(false); }
  };

  /* Unique courses for filter dropdown */
  const allCourseNames = [...new Set(
    barters.flatMap((b) => [b.teachCourse, b.learnCourse].filter(Boolean))
  )].sort();

  const displayList = (tab === 'mine' ? myBarters : barters).filter((b) =>
    !filterCourse || b.teachCourse === filterCourse || b.learnCourse === filterCourse
  );

  return (
    <>
      {showNew && (
        <NewBarterModal
          profileCourses={profileCourses}
          existingActive={myBarters.filter((b) => b.status === 'active')}
          onSubmit={handleCreate}
          onCancel={() => { setShowNew(false); setNewError(''); }}
          loading={newLoading}
          error={newError}
        />
      )}
      {rateTarget && (
        <RateModal barter={rateTarget} onSubmit={handleRate}
          onCancel={() => setRateTarget(null)} loading={rateLoading} />
      )}

      <div className="sz-page">
        {/* Header */}
        <div style={{ marginBottom: '1.1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <h1 style={{ margin:0, fontSize:'1.25rem' }}>{t('barter.title')}</h1>
            <button className="btn-sz-primary"
              style={{ padding:'0.45rem 0.9rem', fontSize:'0.82rem' }}
              disabled={activeCount >= MAX_ACTIVE}
              onClick={() => { setNewError(''); setShowNew(true); }}>
              + {t('barter.newRequest')}
            </button>
          </div>

          {/* BR-12: progress bar */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
              <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.06em',
                textTransform:'uppercase', color:'var(--sz-muted)' }}>
                {t('barter.active')} {activeCount}/{MAX_ACTIVE}
              </span>
              {activeCount >= MAX_ACTIVE && (
                <span style={{ fontSize:'0.7rem', fontWeight:700, color:'#C05621' }}>
                  {t('barter.maxLimitWarning')}
                </span>
              )}
            </div>
            <div style={{ height:4, background:'var(--sz-border)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:2,
                width:`${(activeCount/MAX_ACTIVE)*100}%`,
                background: activeCount >= MAX_ACTIVE ? '#E53E3E' : 'var(--sz-primary)',
                transition:'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {error && <div className="sz-alert sz-alert-danger">{error}</div>}

        {/* Tabs */}
        <div className="sz-tabs">
          <button className={`sz-tab${tab==='all'  ? ' active':''}`} onClick={() => setTab('all')}>
            {t('barter.allRequests')}
          </button>
          <button className={`sz-tab${tab==='mine' ? ' active':''}`} onClick={() => setTab('mine')}>
            {t('barter.myRequests')}
            {myBarters.length > 0 && (
              <span style={{ marginLeft:'0.35rem', background:'var(--sz-primary)', color:'#fff',
                borderRadius:'50px', padding:'0 0.4rem', fontSize:'0.7rem', fontWeight:700 }}>
                {myBarters.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '1rem' }}>
          <select className="sz-input" value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}>
            <option value="">{t('barter.allCourses')}</option>
            {allCourseNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* List */}
        {loading ? (
          [1,2,3].map((n) => (
            <div key={n} className="sz-barter-card">
              <div className="sz-skeleton" style={{ height:14, width:'60%', marginBottom:8 }} />
              <div className="sz-skeleton" style={{ height:12, width:'35%' }} />
            </div>
          ))
        ) : displayList.length === 0 ? (
          <p style={{ textAlign:'center', color:'var(--sz-muted)', padding:'3rem 0', fontSize:'0.9rem' }}>
            {t('barter.noRequests')}
          </p>
        ) : (
          displayList.map((b) => (
            <BarterCard key={b.id} barter={b}
              isOwn={(b.userName||'').trim().toLowerCase() === (user?.name||'').trim().toLowerCase()}
              onComplete={handleComplete}
              onRate={setRateTarget} />
          ))
        )}
      </div>
    </>
  );
}
