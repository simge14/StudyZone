import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { loginUser, extractError } from '../api/auth';
import Toast from './Toast';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* BR-01 soft hint */
  const emailValue  = typeof form.email === 'string' ? form.email.trim() : '';
  const isIsikEmail = emailValue.toLowerCase().endsWith('@isik.edu.tr');
  const showHint    = emailValue.length > 4 && !isIsikEmail;

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* BR-01: guard before any toLowerCase call */
    if (!emailValue) {
      setToast({ type: 'warning', message: 'Lütfen e-posta adresinizi girin.' });
      return;
    }
    if (!form.password) {
      setToast({ type: 'warning', message: 'Lütfen şifrenizi girin.' });
      return;
    }

    setLoading(true);
    try {
      /* auth.js tries /api/auth/login → /api/login → … with both camelCase + PascalCase */
      const data = await loginUser(emailValue.toLowerCase(), form.password);

      const token = data?.token ?? data?.data?.token ?? data?.accessToken;
      const user  = data?.user  ?? data?.data?.user  ?? data?.data ?? data;
      login(user, token);
      navigate('/');
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="sz-page">
        <div className="sz-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>{t('login.title')}</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="sz-form-group">
              <label className="sz-label">{t('login.email')}</label>
              <input
                className={`sz-input${showHint ? ' is-invalid' : ''}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="username@isik.edu.tr"
                inputMode="email"
                autoComplete="email"
                required
                autoFocus
              />
              {showHint && (
                <div className="sz-error">⚠ Sadece @isik.edu.tr e-postaları kabul edilir.</div>
              )}
            </div>

            <div className="sz-form-group">
              <label className="sz-label">{t('login.password')}</label>
              <input
                className="sz-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className="btn-sz-primary btn-full"
              type="submit"
              disabled={loading || !emailValue}
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? t('common.loading') : t('login.submit')}
            </button>
          </form>

          <hr className="sz-divider" />
          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--sz-muted)', margin: 0 }}>
            {t('login.registerLink')}{' '}
            <Link to="/register" style={{ fontWeight: 700 }}>{t('login.signUp')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}
