import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { registerUser, verifyOTP, resendOTP, extractError } from '../api/auth';
import { useCourses } from '../hooks/useCourses';
import { INTEREST_AREAS } from '../data/courses';
import Toast from './Toast';

/* ── Skeleton rows shown while courses are loading ── */
function CourseSkeletonRows() {
  return (
    <>
      {[80, 60, 70, 55, 65].map((w, i) => (
        <div key={i} style={{ padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="sz-skeleton" style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0 }} />
          <div className="sz-skeleton" style={{ height: 13, width: `${w}%`, borderRadius: 4 }} />
        </div>
      ))}
    </>
  );
}

/* ── Course picker — receives courseList from API ── */
/* Trending courses — shown as quick-pick chips when search is empty */
const TRENDING_COURSES = ['SQL Basics', 'Python for Data', 'System Analysis'];

function CoursePicker({ label, hint, selected, onChange, isInvalid, searchPlaceholder, courseList, loading, onRetry }) {
  const [search, setSearch] = useState('');

  const safeCourses = Array.isArray(courseList) ? courseList : [];
  const filtered = loading
    ? []
    : safeCourses.filter((c) => {
        if (typeof c !== 'string') return false;
        return c.toLowerCase().includes(search.toLowerCase()) && !selected.includes(c);
      });

  const toggle = (course) =>
    onChange(selected.includes(course) ? selected.filter((c) => c !== course) : [...selected, course]);

  const isError = !loading && safeCourses.length === 0;

  /* Trending: only show when search is empty and not loading */
  const showTrending = !loading && !isError && !search.trim() && TRENDING_COURSES.some((c) => !selected.includes(c));

  return (
    <div className="sz-form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label className="sz-label" style={{ margin: 0 }}>{label}</label>
        {!loading && safeCourses.length > 0 && (
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sz-muted)', letterSpacing: '0.04em' }}>
            {safeCourses.length} ders
          </span>
        )}
      </div>

      <div className={`sz-course-picker${isInvalid ? ' is-invalid' : ''}${isError ? ' sz-course-picker-error' : ''}`}>
        <input
          className="sz-course-search"
          placeholder={loading ? "SQL'den yükleniyor…" : isError ? 'Bağlantı hatası' : searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading || isError}
        />
        {/* Trending chips — quick pick */}
        {showTrending && (
          <div className="sz-trend-chips">
            {TRENDING_COURSES.filter((c) => !selected.includes(c)).map((c) => (
              <button key={c} type="button" className="sz-trend-chip" onClick={() => toggle(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="sz-course-list">
          {loading ? (
            <>
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.76rem', color: 'var(--sz-muted)', fontWeight: 600, letterSpacing: '0.04em', borderBottom: '1px solid var(--sz-border)' }}>
                Dersler SQL&apos;den çekiliyor…
              </div>
              <CourseSkeletonRows />
            </>
          ) : isError ? (
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.83rem', color: 'var(--sz-muted)' }}>
                ⚠ Ders listesi yüklenemedi.
              </span>
              {onRetry && (
                <button type="button" className="btn-sz-ghost"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', minHeight: 34 }}
                  onClick={onRetry}>
                  ↺ Tekrar Dene
                </button>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '0.75rem 0.9rem', color: 'var(--sz-muted)', fontSize: '0.83rem' }}>
              Eşleşen ders yok
            </div>
          ) : (
            filtered.map((c) => (
              <label key={c} className="sz-course-item">
                <input type="checkbox" checked={false} onChange={() => toggle(c)} />
                {c}
              </label>
            ))
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="sz-badge-wrap">
          {selected.map((c) => (
            <span key={c} className="sz-badge">
              {c}
              <span className="sz-badge-remove" onClick={() => toggle(c)}>✕</span>
            </span>
          ))}
        </div>
      )}
      {isInvalid && <div className="sz-error">⚠ {hint}</div>}
    </div>
  );
}

/* ── Interest area chips ── */
function InterestPicker({ label, hint, selected, onChange, isInvalid }) {
  const toggle = (area) =>
    onChange(selected.includes(area) ? selected.filter((a) => a !== area) : [...selected, area]);
  return (
    <div className="sz-form-group">
      <label className="sz-label">{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {INTEREST_AREAS.map((area) => {
          const sel = selected.includes(area);
          return (
            <button key={area} type="button" onClick={() => toggle(area)}
              style={{ padding: '0.3rem 0.75rem', borderRadius: '50px', border: '1.5px solid', borderColor: sel ? 'var(--sz-primary)' : 'var(--sz-border)', background: sel ? 'var(--sz-primary)' : 'transparent', color: sel ? '#fff' : 'var(--sz-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 36 }}>
              {area}
            </button>
          );
        })}
      </div>
      {isInvalid && <div className="sz-error">{hint}</div>}
    </div>
  );
}

/* ── OTP bottom-sheet modal ── */
function OTPModal({ email, onVerify, onResend, loading, error, devOtp }) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');

  /* Development helper: auto-fill OTP returned by backend */
  const handleDevFill = () => devOtp && setOtp(devOtp);

  return (
    <div className="sz-otp-backdrop">
      <div className="sz-otp-box">
        <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>✉</div>
        <h3 style={{ marginBottom: '0.4rem' }}>{t('register.otpTitle')}</h3>
        <p style={{ color: 'var(--sz-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {t('register.otpDesc')} <strong>{email}</strong>
        </p>

        {/* Dev-only banner: shows actual OTP from backend terminal */}
        {devOtp && process.env.NODE_ENV !== 'production' && (
          <div
            className="sz-alert sz-alert-warning"
            style={{ cursor: 'pointer', marginBottom: '0.75rem', fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700, textAlign: 'center' }}
            onClick={handleDevFill}
            title="Tıkla: otomatik doldur"
          >
            🛠 Dev OTP: {devOtp} — tıkla otomatik doldur
          </div>
        )}

        {error && <div className="sz-alert sz-alert-danger">{error}</div>}

        <input
          className="sz-input sz-otp-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          autoFocus
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <button className="btn-sz-primary btn-full" style={{ marginTop: '1rem' }}
          onClick={() => onVerify(otp)} disabled={otp.length !== 6 || loading}>
          {loading ? t('common.loading') : t('register.verify')}
        </button>
        <button className="btn-sz-ghost btn-full" style={{ marginTop: '0.5rem' }}
          onClick={onResend} disabled={loading}>
          {t('register.resend')}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Register
══════════════════════════════════════════ */
export default function Register() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  /* Fetch course list from API — BR-06 source of truth is the database */
  const { courses: apiCourses, loading: coursesLoading, offline: coursesOffline, retry: retryCourses } = useCourses();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    interests: [], goodAt: [], wantToLearn: [], learnership: '',
  });
  const [touched, setTouched] = useState({});
  const [toast, setToast] = useState(null);      /* { type, message } */
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [kvkk, setKvkk]       = useState(false); /* KVKK consent */
  const [consent, setConsent] = useState(false); /* explicit data-sharing consent */
  const [devOtp, setDevOtp] = useState('');      /* backend returns in dev mode */
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const showError   = (message) => setToast({ type: 'error',   message });
  const showSuccess = (message) => setToast({ type: 'success', message });

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const touch    = (name) => setTouched((p) => ({ ...p, [name]: true }));

  /* BR-01: @isik.edu.tr only — guard against empty/undefined before calling string methods */
  const emailValid    = typeof form.email === 'string' && form.email.trim().length > 0 && form.email.trim().toLowerCase().endsWith('@isik.edu.tr');
  const pwMatch       = form.password === form.confirmPassword;
  const interestsOk   = form.interests.length > 0;
  const goodAtOk      = form.goodAt.length > 0;
  const wantOk        = form.wantToLearn.length > 0;
  const learnOk       = form.learnership !== '';

  /* BR-01 + required field (BR-02) pre-flight checks (used in inline validation above) */
  // eslint-disable-next-line no-unused-vars
  const canSubmit = form.name.trim() && emailValid && form.password.length >= 8 &&
    pwMatch && interestsOk && goodAtOk && wantOk && learnOk;

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Mark all fields as touched to reveal inline validation errors */
    setTouched({ email: true, confirmPassword: true, interests: true, goodAt: true, wantToLearn: true, learnership: true });

    /* BR-01: guard before any toLowerCase */
    if (!form.name.trim()) { showError('Ad Soyad zorunludur.'); return; }
    if (!emailValid)        { showError('Lütfen geçerli bir @isik.edu.tr e-postası girin.'); return; }
    if (form.password.length < 8) { showError('Şifre en az 8 karakter olmalıdır.'); return; }
    if (!pwMatch)           { showError('Şifreler eşleşmiyor.'); return; }
    /* BR-02 & BR-06: required profile fields */
    if (!interestsOk)       { showError('En az bir ilgi alanı seçiniz.'); return; }
    if (!goodAtOk)          { showError('İyi olduğunuz en az bir ders seçiniz.'); return; }
    if (!wantOk)            { showError('Öğrenmek istediğiniz en az bir ders seçiniz.'); return; }
    if (!learnOk)           { showError('Learnership tercihini seçiniz.'); return; }
    if (!kvkk)    { showError(t('register.kvkkRequired'));    return; }
    if (!consent) { showError(t('register.consentRequired')); return; }

    setLoading(true);
    try {
      /* Uses auth.js → tries /api/auth/register, /api/register, etc.
         Sends both camelCase and PascalCase keys to match any backend schema */
      const res = await registerUser({
        name:        form.name.trim(),
        email:       form.email.trim().toLowerCase(),
        password:    form.password,
        interests:   form.interests,
        goodAt:      form.goodAt,
        wantToLearn: form.wantToLearn,
        learnership: form.learnership === 'yes',
      });
      /* Backend returns devOtp in non-production for easy testing */
      if (res?.devOtp) setDevOtp(res.devOtp);
      /* On success → show OTP screen (BR-01 flow) */
      setShowOTP(true);
      showSuccess('Kayıt başarılı! Doğrulama kodunu girin.');
    } catch (err) {
      showError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      /* Uses auth.js → tries /api/auth/verify-otp, /api/verify-otp, etc. */
      const data = await verifyOTP(form.email.trim().toLowerCase(), otp);
      /* Backend may return token in data.token or data.data.token */
      const token = data?.token ?? data?.data?.token ?? data?.accessToken;
      const user  = data?.user  ?? data?.data?.user  ?? data?.data ?? data;
      login(user, token);
      navigate('/');
    } catch (err) {
      setOtpError(extractError(err));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setOtpError('');
    try {
      await resendOTP(form.email.trim().toLowerCase());
    } catch (err) {
      setOtpError(extractError(err));
    }
  };

  return (
    <>
      {showOTP && (
        <OTPModal email={form.email} onVerify={handleVerify} onResend={handleResend}
          loading={otpLoading} error={otpError} devOtp={devOtp} />
      )}

      {/* Mobile-friendly toast — slides up above bottom nav */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="sz-page">
        <div className="sz-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>{t('register.title')}</h2>
          {coursesOffline && (
            <div className="sz-alert sz-alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠ Ders listesi yüklenemedi — backend çalışıyor mu? (port 3000)</span>
              <button type="button" className="btn-sz-ghost"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', minHeight: 32, flexShrink: 0 }}
                onClick={retryCourses}>
                ↺ Dene
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="sz-form-group">
              <label className="sz-label">{t('register.name')}</label>
              <input className="sz-input" type="text" placeholder={t('register.namePlaceholder')}
                value={form.name} onChange={(e) => setField('name', e.target.value)} required autoFocus />
            </div>

            {/* Email — BR-01 */}
            <div className="sz-form-group">
              <label className="sz-label">{t('register.email')}</label>
              <input
                className={`sz-input${touched.email && !emailValid ? ' is-invalid' : ''}`}
                type="email" placeholder={t('register.emailPlaceholder')}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => touch('email')} required
              />
              {touched.email && !emailValid && <div className="sz-error">⚠ {t('register.emailError')}</div>}
            </div>

            {/* Password */}
            <div className="sz-form-group">
              <label className="sz-label">{t('register.password')}</label>
              <input className="sz-input" type="password"
                placeholder={t('register.passwordPlaceholder')}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                minLength={8} required />
              {form.password.length > 0 && form.password.length < 8 && (
                <div className="sz-error">⚠ En az 8 karakter gereklidir ({form.password.length}/8)</div>
              )}
            </div>

            {/* Confirm */}
            <div className="sz-form-group">
              <label className="sz-label">{t('register.confirmPassword')}</label>
              <input
                className={`sz-input${touched.confirmPassword && !pwMatch ? ' is-invalid' : ''}`}
                type="password" placeholder="••••••••"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                onBlur={() => touch('confirmPassword')}
              />
              {touched.confirmPassword && !pwMatch && <div className="sz-error">⚠ {t('register.confirmPasswordError')}</div>}
            </div>

            <hr className="sz-divider" />

            {/* Interests — BR-02 */}
            <InterestPicker label={t('register.interests')} hint={t('register.interestsHint')}
              selected={form.interests} onChange={(v) => setField('interests', v)}
              isInvalid={touched.interests && !interestsOk} />

            {/* Good At — BR-06, source: /api/courses */}
            <CoursePicker label={t('register.goodAt')} hint={t('register.goodAtHint')}
              selected={form.goodAt} onChange={(v) => setField('goodAt', v)}
              isInvalid={touched.goodAt && !goodAtOk}
              searchPlaceholder={t('register.searchCourses')}
              courseList={apiCourses} loading={coursesLoading} onRetry={retryCourses} />

            {/* Want to Learn — BR-06 */}
            <CoursePicker label={t('register.wantToLearn')} hint={t('register.wantToLearnHint')}
              selected={form.wantToLearn} onChange={(v) => setField('wantToLearn', v)}
              isInvalid={touched.wantToLearn && !wantOk}
              searchPlaceholder={t('register.searchCourses')}
              courseList={apiCourses} loading={coursesLoading} onRetry={retryCourses} />

            {/* Learnership — BR-04 */}
            <div className="sz-form-group">
              <label className="sz-label">{t('register.learnership')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['yes', 'no'].map((v) => (
                  <label key={v} onClick={() => { setField('learnership', v); touch('learnership'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.65rem 1rem', borderRadius: 'var(--sz-radius)', border: '1.5px solid', borderColor: form.learnership === v ? 'var(--sz-primary)' : 'var(--sz-border)', background: form.learnership === v ? 'rgba(108,92,231,0.07)' : 'transparent', fontWeight: 600, fontSize: '0.88rem', color: form.learnership === v ? 'var(--sz-primary)' : 'var(--sz-muted)', transition: 'all 0.15s ease', minHeight: 44 }}>
                    <input type="radio" name="learnership" value={v} checked={form.learnership === v}
                      onChange={() => {}} style={{ accentColor: 'var(--sz-primary)', width: 17, height: 17 }} />
                    {v === 'yes' ? t('register.learnYes') : t('register.learnNo')}
                  </label>
                ))}
              </div>
              {touched.learnership && !learnOk && <div className="sz-error">⚠ Seçim yapınız</div>}
            </div>

            {/* ── Legal consent checkboxes ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1.1rem 0 0.85rem' }}>
              {/* KVKK */}
              <label className={`sz-consent-row${kvkk ? ' checked' : ''}`}>
                <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} />
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  {t('register.kvkkLabel')}
                </span>
              </label>

              {/* Açık Rıza */}
              <label className={`sz-consent-row${consent ? ' checked' : ''}`}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {t('register.consentLabel')}
                </span>
              </label>
            </div>

            <button className="btn-sz-primary btn-full" type="submit"
              disabled={loading || !kvkk || !consent}
              style={{ marginTop: '0.25rem' }}>
              {loading ? t('common.loading') : t('register.submit')}
            </button>
          </form>

          <hr className="sz-divider" />
          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--sz-muted)', margin: 0 }}>
            {t('register.loginLink')}{' '}
            <Link to="/login" style={{ fontWeight: 700 }}>{t('register.signIn')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}
